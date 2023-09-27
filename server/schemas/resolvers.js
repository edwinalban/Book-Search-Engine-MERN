const { AuthenticationError } = require('./apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { error } = require('console');

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
        addUser: async(parent, args) => {
            try {
                const user = await User.create(args);

                if (!user) {
                    throw new error('Something is wrong!')
                }

                const token = signToken(user);
                return { token, user };
            } catch (e) {
                console.log(e);
            }
        }
    }
};

module.exports = resolvers;