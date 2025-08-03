import { configure } from "@codegenie/serverless-express";
import { app } from "./index";

export const handler = configure({ app });
