const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const defaultCookieAge = 1000 * 60 * 60 * 24 * 365;

const mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to create an item!');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
        },
      },
      info,
    );

    return item;
  },
  updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info,
    );
  },
  updateItemNoImage(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info,
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    const item = await ctx.db.query.item({ where }, '{ id title user { id }}');
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some((p) => ['ADMIN', 'ITEMDELETE'].includes(p));
    if (!ownsItem && !hasPermissions) {
      throw new Error('You don\'t have permission to do that!');
    }

    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // eslint-disable-next-line no-param-reassign
    args.email = args.email.toLowerCase();

    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info,
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: defaultCookieAge,
    });

    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No user found for the email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: defaultCookieAge,
    });

    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No user found for the email ${args.email}`);
    }
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });

    const mailRes = await transport.sendMail({
      from: 'nishikinomaki@mail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(
        `Your Password Reset Token is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`,
      ),
    });

    return { message: 'Thanks for reseting' };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error('Passwords do not match!');
    }
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired');
    }
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: defaultCookieAge,
    });

    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info,
    );
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info,
    );
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be signed in!');
    }
    const cartItems = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    const [existingCartItem] = cartItems;
    if (existingCartItem) {
      console.log('This item is already in their cart!');
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      }, info);
    }

    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      },
    }, info);
  },
  async removeFromCart(parent, args, ctx, info) {
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id,
      },
    }, '{ id, user { id }}');
    if (!cartItem) {
      throw new Error('This item is not in your cart!');
    }
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('You don\'t have permission to do that!');
    }
    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
  },
  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) throw new Error('You must be singed in to complete this order.');

    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            title
            price
            id
            description
            image
            largeImage
          }
        }
      }`,
    );
    console.log(user);

    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.quantity * cartItem.item.price,
      0,
    );

    console.log(`Going to charge for: ${amount}`);
    console.log(`token: ${args.token}`);
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    console.log(charge);

    const orderItems = user.cart.map((cartItem) => {
      const orderItem = {
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
        ...cartItem.item,
      };
      delete orderItem.id;
      return orderItem;
    });

    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });

    const cartItemIds = user.cart.map((cartItem) => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });

    return order;
  },
};

module.exports = mutations;
