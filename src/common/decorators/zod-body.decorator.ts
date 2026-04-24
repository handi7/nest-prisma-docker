import { Body } from "@nestjs/common";
import { ZodType } from "zod";

import { ZodBodyPipe } from "../pipes/zod-body.pipe";

export const ZodBody = (schema: ZodType) => Body(new ZodBodyPipe(schema));
