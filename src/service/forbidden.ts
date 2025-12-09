import service from "@/utils/request";

export async function select(params: object) {
  return await service.post("/forbiddenVideo/select", params);
}
export async function detail(params: object) {
  return service.post("/forbiddenVideo/detail", params);
}

export async function like(params: object) {
  return service.post("/like/toggle", params);
}

export async function collect(params: object) {
  return service.post("/favorite/toggle", params);
}

export async function getCategories() {
  return service.get("/forbiddenVideo/category", {
    method: "GET",
  });
}
