import { OpenAPIObject, OperationObject, PathItemObject, TagObject } from "@nestjs/swagger";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head"] as const;

/** "UserInvite" -> "User Invite" */
function humanize(tag: string): string {
  return tag.replace(/([a-z\d])([A-Z])/g, "$1 $2");
}

/**
 * Turns the default tags into readable section titles and lists them alphabetically.
 *
 * A controller without `@ApiTags` is tagged with its class name minus the `Controller` suffix
 * (`UserInvite`). Splitting that on the case boundary is mechanical, so it is done once over the
 * finished document instead of in a decorator per controller. Swagger UI orders sections by the
 * document's `tags` array, which is otherwise empty, so it is filled in here too.
 */
export function applyTags(document: OpenAPIObject): void {
  const described = new Map(document.tags?.map((tag) => [humanize(tag.name), tag.description]));
  const used = new Set<string>();

  for (const pathItem of Object.values(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation: OperationObject = (pathItem as PathItemObject)[method];

      if (!operation?.tags) {
        continue;
      }

      operation.tags = [...new Set(operation.tags.map(humanize))];
      operation.tags.forEach((tag) => used.add(tag));
    }
  }

  document.tags = [...used].sort().map(
    (name): TagObject => ({
      name,
      description: described.get(name) ?? "",
    }),
  );
}
