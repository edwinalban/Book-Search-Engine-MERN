const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOne({ _id: context.user._id })
                    .populate('savedBooks');

                return user;
            }

            throw new AuthenticationError('You are not logged in');
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
                const user = await User.findOne({ email });

                if (!user) {
                    throw new AuthenticationError('Incorrect credentials');
                }

                const correctPw = await user.isCorrectPassword(password);

                if (!correctPw) {
                    throw new AuthenticationError('Incorrect credentials');
                }

                const token = signToken(user);
                return { token, user };
        },
        addUser: async (parent, args) => {
                const user = await User.create(args);
                const token = signToken(user);

                return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                    const user = await User.findOne({ _id: context.user._id });

                    user.savedBooks.push(bookData);
                    user.save();
                    return user;
            }
            throw new AuthenticationError('You are not logged in.');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                    const user = await User.findOne({ _id: context.user._id });
                    console.log(user.savedBooks.bookId);
                    user.savedBooks.pull(bookId);
                    user.save();
                    return user;
            }
            throw new AuthenticationError('You are not logged in.')
        }
    }
};

module.exports = resolvers;