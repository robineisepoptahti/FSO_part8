const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const Book = require("./models/Book");
const Author = require("./models/Author");
const User = require("./models/User");
const mongoose = require("mongoose");
require("dotenv").config();
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

mongoose.set("strictQuery", false);
const MONGODB_URI = process.env.MONGODB_URI;
console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

/*
let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  bookCount: Int
  authorCount: Int
  allBooks(author: String, genre: String): [Book!]
  allAuthors: [Author!]
  me: User
}
type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}

type Author {
    name: String!
    bookCount: Int
    born: Int
    }

type Mutation {
  addBook(
  title: String!
  author: String!
  published: Int!
  genres: [String!]
): Book!



editAuthor (
name: String!
setBornTo: Int!
): Author


createUser(
    username: String!
    favoriteGenre: String!
  ): User

login(
    username: String!
    password: String!
  ): Token
}
`;

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser;
    },
    bookCount: async () => {
      const foundBooks = await Book.find({});
      return foundBooks.length;
    },
    authorCount: async () => {
      const foundBooks = await Author.find({});
      return foundBooks.length;
    },
    allBooks: async (root, args) => {
      let foundBooks = null;
      if (args.genre && args.author) {
        const foundAuthor = await Author.findOne({ name: args.author });
        if (!foundAuthor) {
          foundBooks = [];
        } else {
          foundBooks = await Book.find({
            genres: args.genre,
            author: foundAuthor._id,
          });
        }
      } else if (args.genre) {
        foundBooks = await Book.find({ genres: args.genre });
      } else if (args.author) {
        const foundAuthor = await Author.findOne({ name: args.author });
        if (!foundAuthor) {
          foundBooks = [];
        } else {
          foundBooks = await Book.find({ author: foundAuthor._id });
        }
      } else {
        foundBooks = await Book.find({});
      }
      return foundBooks;
    },
    allAuthors: async () => {
      const foundAuthor = await Author.find({});
      return foundAuthor;
    },
  },
  Author: {
    bookCount: async (root) => {
      const count = await Book.find({ author: root._id });
      return count.length;
    },
  },
  Book: {
    author: async (root) => {
      const author = await Author.findOne({ _id: root.author });
      return author;
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (args.author) {
        try {
          const currentUser = context.currentUser;
          if (!currentUser) {
            throw new GraphQLError("No user logged in", {
              extensions: {
                code: "BAD_USER_INPUT",
                invalidArgs: args.name,
                error,
              },
            });
          }
          let foundAuthor = await Author.findOne({ name: args.author });
          if (!foundAuthor) {
            foundAuthor = new Author({ name: args.author });
            await foundAuthor.save();
          }
          const book = new Book({
            ...args,
            author: foundAuthor._id,
          });
          const saved = await book.save();
          return saved;
        } catch (error) {
          throw new GraphQLError("Adding book failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              error,
            },
          });
        }
      }
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username });
      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },

    editAuthor: async (root, args, context) => {
      try {
        const currentUser = context.currentUser;
        if (!currentUser) {
          throw new GraphQLError("No user logged in", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              error,
            },
          });
        }
        let copy = await Author.findOne({ name: args.name });
        if (copy) {
          const result = await Author.updateOne(
            { name: args.name },
            { born: args.setBornTo }
          );
          if (result.acknowledged) {
            copy = await Author.findOne({ name: args.name });
          }
        }
        return copy;
      } catch (error) {
        throw new GraphQLError("Editing author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
