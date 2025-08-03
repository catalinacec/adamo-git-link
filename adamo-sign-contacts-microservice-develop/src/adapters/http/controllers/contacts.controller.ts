import { Request, Response } from "express";
import { ContactRepository } from "../../../infrastructure/repositories/contacts.repository";
import {
  ApiResponse,
  Pagination,
} from "../../../domain/models/api-response.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  setPagination,
  setSuccessMessage,
} from "../../../utils/responseHelpers";
import { HttpError } from "../../../utils/httpError";
import { getErrorMessage } from "../../../utils/setErrorMessage";
import { getRegisterContactSchema } from "../../../validators/registerContact.validator";
import { formatYupErrors } from "../../../utils/formatYupErrors";
import { getUpdateContactSchema } from "../../../validators/updateContact.validator";
import { BulkDeleteContactsUseCase } from "../../../application/use-cases/bulkDeleteContacts.usecase";

const contactRepo = new ContactRepository();
const bulkDeleteContactsUseCase = new BulkDeleteContactsUseCase();

export class ContactsController {
  static async health(req: Request, res: Response) {
    try {
      const isHealthy = true;

      if (isHealthy) {
        return res.status(200).json({
          status: "success",
          message: "Microservice is healthy",
        });
      } else {
        throw new Error("Microservice is not healthy");
      }
    } catch (error: any) {
      return res.status(500).json({
        status: "error",
        message: error.message || "Microservice is not healthy",
      });
    }
  }

  static async getContacts(req: Request, res: Response) {
    const t = req.t;

    try {
      const { page = 1, limit = 10, search } = req.query;

      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        const message = getErrorMessage(
          req,
          "auth",
          "missing",
          t("errors.token.missing")
        );
        throw new HttpError(401, message);
      }

      try {
        const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!.replace(
          /\\n/g,
          "\n"
        );
        const decodedToken: JwtPayload = jwt.verify(token, JWT_PUBLIC_KEY, {
          algorithms: ["RS256"],
        }) as JwtPayload;

        if (
          !decodedToken ||
          typeof decodedToken !== "object" ||
          !decodedToken.id
        ) {
          const message = getErrorMessage(
            req,
            "auth",
            "missing",
            t("errors.token.invalid")
          );
          throw new HttpError(401, message);
        }

        const query: any = { userId: decodedToken.id };
        if (search) {
          const searchRegex = new RegExp(String(search), "i");
          query.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ["$firstName", " ", "$lastName"] },
                  regex: String(search),
                  options: "i",
                },
              },
            },
          ];
        }

        const contacts = await contactRepo.findAll(
          query,
          Number(page),
          Number(limit)
        );

        const pagination = new Pagination(
          contacts.page ?? 0,
          contacts.totalPages,
          contacts.limit,
          contacts.totalDocs,
          contacts.nextPage ?? null,
          contacts.prevPage ?? null,
          contacts.hasNextPage ?? false,
          contacts.hasPrevPage ?? false
        );

        setSuccessMessage(req, res, "contacts", "list");
        setPagination(res, pagination);
        res.status(200).json(contacts.docs);
      } catch (error) {}
    } catch (error) {
      const message = getErrorMessage(
        req,
        "contacts",
        "list",
        t("errors.token.invalid")
      );
      throw new HttpError(400, message);
    }
  }

  static async createContact(req: Request, res: Response) {
    try {
      const t = req.t;

      try {
        const schema = getRegisterContactSchema(t);
        await schema.validate(req.body, { abortEarly: false });
      } catch (err: any) {
        if (err.name === "ValidationError" && Array.isArray(err.errors)) {
          const formattedErrors = formatYupErrors(err.inner, t);
          throw new HttpError(
            400,
            t("errors.contact.missing_parameters"),
            undefined,
            undefined,
            formattedErrors
          );
        }

        throw err;
      }

      const { userId, ...contactData } = req.body;

      if (typeof contactData !== "object") {
        throw new HttpError(400, t("errors.contact.invalid_format"));
      }

      const existing = await contactRepo.findAll({
        email: contactData.email,
      });

      if (existing && existing.docs.length > 0) {
        throw new HttpError(400, t("errors.resource.email_exists"));
      }

      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new HttpError(401, t("errors.token.missing"));
      }

      const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");
      const decodedToken = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      });

      if (
        !decodedToken ||
        typeof decodedToken !== "object" ||
        !decodedToken.id
      ) {
        throw new HttpError(401, t("errors.token.invalid"));
      }

      const newContact = await contactRepo.create({
        userId: decodedToken.id,
        ...contactData,
      });

      setSuccessMessage(req, res, "contact", "create");
      res.status(201).json(newContact);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "contact", "create");
      throw new HttpError(500, message);
    }
  }

  static async updateContact(req: Request, res: Response) {
    try {
      const t = req.t;

      try {
        const schema = getUpdateContactSchema(t);
        await schema.validate(req.body, { abortEarly: false });
      } catch (err: any) {
        if (err.name === "ValidationError" && Array.isArray(err.errors)) {
          const formattedErrors = formatYupErrors(err.inner, t);
          throw new HttpError(
            400,
            t("errors.contact.missing_parameters"),
            undefined,
            undefined,
            formattedErrors
          );
        }

        throw err;
      }

      const { id } = req.params;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new HttpError(401, t("errors.token.missing"));
      }

      const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");
      const decodedToken = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      });

      if (
        !decodedToken ||
        typeof decodedToken !== "object" ||
        !decodedToken.id
      ) {
        throw new HttpError(401, t("errors.token.invalid"));
      }

      const updatedContact = await contactRepo.update(id, req.body);

      if (!updatedContact) {
        throw new HttpError(404, t("errors.contact.not_found"));
      }

      setSuccessMessage(req, res, "contact", "update");
      res.status(200).json(updatedContact);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const message = getErrorMessage(req, "contact", "update");
      throw new HttpError(500, message);
    }
  }

  static async deleteContact(req: Request, res: Response) {
    try {
      const t = req.t;

      const { id } = req.params;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new HttpError(401, t("errors.token.missing"));
      }

      const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n");
      const decodedToken = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      });

      if (
        !decodedToken ||
        typeof decodedToken !== "object" ||
        !decodedToken.id
      ) {
        throw new HttpError(401, t("errors.token.invalid"));
      }

      const deletedContact = await contactRepo.delete(id);

      if (!deletedContact) {
        const message = getErrorMessage(req, "contact", "delete");
      }

      setSuccessMessage(req, res, "contact", "delete");
      res.status(204).json(null);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const message = getErrorMessage(req, "contact", "delete");
      throw new HttpError(500, message);
    }
  }

  static async bulkDeleteContacts(req: Request, res: Response) {
    try {
      const userId = req.user?.id ?? "";
      const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];

      if (ids.length === 0) {
        throw new HttpError(
          400,
          req.t("validation.min_array", { field: "ids", min: 1 })
        );
      }

      const result = await bulkDeleteContactsUseCase.execute(userId, ids);

      setSuccessMessage(req, res, "contacts", "delete");
      return res.status(202).json(result);
    } catch (error: any) {
      const message = getErrorMessage(req, "contacts", "delete");
      throw new HttpError(500, message);
    }
  }
}
