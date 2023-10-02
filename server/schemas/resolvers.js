const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

// set up resolvers variable to be exported
const resolvers = {
    // set up query for logged in user based on context
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
    // set up mutations to update the database
    Mutation: {
        // set up function to allow user to log in with email and password
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
        // set up function to allow user to create an account
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        // set up function to allow user to save books to their profile
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const user = await User.findOne({ _id: context.user._id });

                user.savedBooks.push(bookData);
                user.save();
                return user;
            }
            throw new AuthenticationError('You are not logged in.');
        },
        // set up function to allow user to remove books from saved books in their profile
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return user;
            }
            throw new AuthenticationError('You are not logged in.')
        }
    }
};

// export resolvers
module.exports = resolvers;