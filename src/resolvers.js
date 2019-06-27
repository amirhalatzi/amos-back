import { neo4jgraphql } from "neo4j-graphql-js";
import bcrypt from "bcrypt";
import { isNil } from "lodash";

import { createToken } from "./auth/auth";

export const resolvers = {
  Mutation: {
    RegisterUser: async (object, params, context, resolveInfo) => {
      const user = params;
      user.password = await bcrypt.hash(user.password, 12);
      return neo4jgraphql(object, user, context, resolveInfo, true);
    },
    Login: async (object, { email, password }, context, resolveInfo) => {
      const user = await neo4jgraphql(
        object,
        { email, password },
        context,
        resolveInfo
      );
      if (!user) {
        throw new Error("No user with that email");
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Incorrect password");
        return null;
      }

      const signedToken = await createToken(
        {
          user: { id: user.id, username: user.username }
        },
        context.SECRET
      );

      return `${signedToken}`;
    }
  },
  Query: {
    currentUser: async (object, params, context, resolveInfo) => {
      
    //   Here check if user authenticated
      if (isNil(context.user && context.user.id)) {
        return null;
      }
      const userID = context.user.id;

      const { id, email, username } = await neo4jgraphql(
        object,
        { user: userID },
        context,
        resolveInfo
      );

      return {
        id,
        email,
        username
      };
    }
  }
};
