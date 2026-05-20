import httpClient, { httpRequest } from "../../shared/utils/httpClient";
import { Categories } from "../types/constants";

const PRODUCT_ENDPOINTS = ["/products"];
const PRODUCT_CATEGORY_ENDPOINTS = ["/products-categories", "/product-categories"];
const TECHNICAL_SHEET_ENDPOINTS = {
  api: {
    list: (productId) => `/products/${productId}/tecnicas`,
    get: (productId, sheetId) => `/products/${productId}/tecnicas/${sheetId}`,
    create: (productId) => `/products/${productId}/tecnicas`,
    delete: (productId, sheetId) => `/products/${productId}/tecnicas/${sheetId}`,
  },
  back: {
    list: (productId) => `/products/${productId}/technical-sheets`,
    get: (productId, sheetId) => `/products/${productId}/technical-sheets/${sheetId}`,
    create: (productId) => `/products/${productId}/technical-sheets`,
    delete: (productId, sheetId) => `/products/${productId}/technical-sheets/${sheetId}`,
  },
};

const unwrapResponse = (response) => {
  if (!response) return response;

  return (
    response.products ??
    response.product ??
    response.productos ??
    response.producto ??
    response.technical_sheets ??
    response.technicalSheets ??
    response.tecnicas ??
    response.fichasTecnicas ??
    response.categories ??
    response.categorias ??
    response.data?.products ??
    response.data?.product ??
    response.data?.productos ??
    response.data?.producto ??
    response.data?.technical_sheets ??
    response.data?.technicalSheets ??
    response.data?.tecnicas ??
    response.data?.fichasTecnicas ??
    response.data?.categories ??
    response.data?.categorias ??
    response.data?.data ??
    response.data ??
    response
  );
};

const asArray = (response) => {
  const data = unwrapResponse(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.productos)) return data.productos;
  return [];
};

const requestEndpointFallback = async (endpoints, options = {}) => {
  let lastError;

  for (const endpoint of endpoints) {
    try {
      return await httpRequest(endpoint, options);
    } catch (error) {
      lastError = error;
      if (![404, 400, 422].includes(error?.status)) {
        throw error;
      }
    }
  }

  throw lastError;
};

const sendWithPayloadFallback = async (endpoint, method, payloads) => {
  let lastError;

  for (const payload of payloads) {
    try {
      return await httpRequest(endpoint, { method, body: payload });
    } catch (error) {
      lastError = error;
      if (![400, 422].includes(error?.status)) {
        throw error;
      }
    }
  }

  throw lastError;
};

const toDateString = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().split("T")[0];
};

const categoryNameFromId = (categoryId, categories = []) => {
  const category = categories.find((cat) => String(cat.id ?? cat._id) === String(categoryId));
  return (
    category?.name ??
    category?.nombre ??
    Categories.find((cat) => String(cat.id) === String(categoryId))?.name ??
    "General"
  );
};

const toUiCategory = (raw) => {
  if (!raw) return raw;
  return {
    id: raw.id ?? raw._id ?? raw.id_categoria_producto ?? raw.id_categorias ?? raw.id_categoria,
    _id: raw._id,
    name: raw.name ?? raw.nombre ?? raw.categoryName ?? raw.nombre_categoria ?? "",
  };
};

const toUiProduct = (raw, categories = []) => {
  if (!raw) return raw;
  const categoryId = raw.id_categorias ?? raw.id_categoria ?? raw.idCategoria ?? raw.categoryId;
  const image = raw.image ?? raw.imagenes_Url?.[0] ?? raw.imagenesUrl?.[0] ?? null;

  return {
    id: raw.id ?? raw._id,
    _id: raw._id,
    id_categorias: categoryId,
    id_categoria: categoryId,
    categoryId,
    image,
    reference: raw.reference ?? raw.referencia ?? "",
    name: raw.name ?? raw.nombre ?? "",
    category: raw.category ?? raw.nombreCategoria ?? categoryNameFromId(categoryId, categories),
    price: raw.price ?? raw.precio ?? 0,
    stock: raw.stock ?? 0,
    active: raw.active ?? raw.estado ?? raw.activo ?? true,
    technicalSheetVersions: raw.technicalSheetVersions ?? raw.versiones ?? 0,
    lastVersionDate: raw.lastVersionDate ?? toDateString(raw.updatedAt ?? raw.createdAt),
    technicalSheet: raw.technicalSheet ?? null,
  };
};

const toUiSheet = (raw) => {
  if (!raw) return raw;
  return {
    id: raw.id ?? raw._id,
    productId: raw.productId ?? raw.id_producto ?? raw.id_productos,
    version: raw.version ?? raw.versiones ?? 1,
    date: toDateString(raw.date ?? raw.fecha_inicio ?? raw.createdAt) ?? new Date().toISOString().split("T")[0],
    client: raw.client ?? raw.responsable ?? raw.createdBy ?? "",
    type: raw.type ?? "Ficha tecnica",
    description: raw.description ?? raw.descripcion ?? raw.descripciones ?? "",
    fabrics: raw.fabrics ?? [],
    cups: raw.cups ?? [],
    closures: raw.closures ?? [],
    accessories: raw.accessories ?? [],
    observations: raw.observations ?? "",
    createdBy: raw.createdBy ?? raw.responsable ?? "",
    raw,
  };
};

const getCategories = async () => {
  try {
    const response = await requestEndpointFallback(PRODUCT_CATEGORY_ENDPOINTS, { method: "GET" });
    const data = unwrapResponse(response);
    return Array.isArray(data) ? data.map(toUiCategory) : Categories;
  } catch {
    return Categories;
  }
};

const resolveCategoryId = async (productData) => {
  const explicitId = productData.categoryId ?? productData.id_categorias ?? productData.id_categoria ?? productData.idCategoria;
  if (explicitId && !Number.isInteger(Number(explicitId))) return explicitId;

  const categories = await getCategories();
  const byName = categories.find((cat) => {
    const name = cat.name ?? cat.nombre;
    return name?.toLowerCase() === productData.category?.toLowerCase();
  });

  const resolvedId = byName?.id ?? byName?._id ?? explicitId;
  if (!resolvedId || Number.isInteger(Number(resolvedId))) {
    throw new Error("Selecciona una categoria registrada antes de guardar el producto");
  }

  return resolvedId;
};

const buildProductPayloads = async (productData) => {
  const categoryId = await resolveCategoryId(productData);
  const image = productData.image ? [productData.image] : [];
  const reference = productData.reference ?? productData.referencia;
  const name = productData.name ?? productData.nombre;
  const price = Number(productData.price ?? productData.precio);
  const stock = Number(productData.stock);

  return [
    {
      id_categorias: categoryId,
      imagenes_Url: image,
      referencia: reference,
      nombre: name,
      precio: price,
      stock,
    },
    {
      id_categoria: categoryId,
      imagenes_Url: image,
      referencia: reference,
      nombre: name,
      precio: price,
      stock,
    },
    {
      categoryId,
      image: productData.image ?? null,
      reference,
      name,
      price,
      stock,
    },
  ];
};

const buildTechnicalSheetPayloads = (productId, sheetData = {}) => {
  const date = sheetData.date ?? new Date().toISOString().split("T")[0];
  const version = Number(sheetData.version ?? 1);
  const description = sheetData.description ?? sheetData.observations ?? "";
  const responsible = sheetData.createdBy ?? sheetData.client ?? "Sin responsable";

  return [
    {
      id_producto: productId,
      responsable: responsible,
      fecha_inicio: date,
      fecha_fin: date,
      versiones: version,
      descripciones: description || false,
    },
    {
      productId,
      version,
      date,
      client: sheetData.client ?? responsible,
      type: sheetData.type ?? "Ficha tecnica",
      description,
      fabrics: sheetData.fabrics ?? [],
      cups: sheetData.cups ?? [],
      closures: sheetData.closures ?? [],
      accessories: sheetData.accessories ?? [],
      observations: sheetData.observations ?? "",
      createdBy: responsible,
    },
  ];
};

const getTechnicalSheetEndpoints = (productId) => [
  TECHNICAL_SHEET_ENDPOINTS.api.list(productId),
  TECHNICAL_SHEET_ENDPOINTS.back.list(productId),
];

const createTechnicalSheetEndpoints = (productId) => [
  TECHNICAL_SHEET_ENDPOINTS.api.create(productId),
  TECHNICAL_SHEET_ENDPOINTS.back.create(productId),
];

export const productAPI = {
  getAll: async () => {
    const categories = await getCategories();
    const response = await requestEndpointFallback(PRODUCT_ENDPOINTS, { method: "GET" });
    const products = asArray(response).map((product) => toUiProduct(product, categories));

    return Promise.all(
      products.map(async (product) => {
        try {
          const versions = await productAPI.getTechnicalSheetVersions(product.id);
          const sorted = [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
          return {
            ...product,
            technicalSheet: sorted[0] ?? null,
            technicalSheetVersions: sorted.length || product.technicalSheetVersions,
            lastVersionDate: sorted[0]?.date ?? product.lastVersionDate,
          };
        } catch {
          return product;
        }
      })
    );
  },

  getById: async (id) => {
    const categories = await getCategories();
    const response = await requestEndpointFallback(PRODUCT_ENDPOINTS.map((endpoint) => `${endpoint}/${id}`), { method: "GET" });
    const product = toUiProduct(unwrapResponse(response), categories);
    const versions = await productAPI.getTechnicalSheetVersions(product.id).catch(() => []);
    const sorted = [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0));

    return {
      ...product,
      technicalSheet: sorted[0] ?? null,
      technicalSheetVersions: sorted.length || product.technicalSheetVersions,
      lastVersionDate: sorted[0]?.date ?? product.lastVersionDate,
    };
  },

  create: async (productData) => {
    const { technicalSheet } = productData || {};
    const payloads = await buildProductPayloads(productData);
    const response = await sendWithPayloadFallback(PRODUCT_ENDPOINTS[0], "POST", payloads);
    const created = toUiProduct(unwrapResponse(response), await getCategories());

    if (technicalSheet && created.id) {
      const createdSheet = await productAPI.createTechnicalSheet({ ...technicalSheet, productId: created.id });
      created.technicalSheet = createdSheet;
      created.technicalSheetVersions = 1;
      created.lastVersionDate = createdSheet?.date ?? created.lastVersionDate;
    }

    return created;
  },

  update: async (id, updatedData) => {
    const { technicalSheet } = updatedData || {};
    const payloads = await buildProductPayloads(updatedData);
    const response = await sendWithPayloadFallback(`${PRODUCT_ENDPOINTS[0]}/${id}`, "PUT", payloads);
    const updated = toUiProduct(unwrapResponse(response), await getCategories());

    if (technicalSheet) {
      const updatedSheet = await productAPI.updateTechnicalSheet(id, technicalSheet);
      updated.technicalSheet = updatedSheet;
      updated.technicalSheetVersions = updatedSheet?.version ?? updated.technicalSheetVersions ?? 1;
      updated.lastVersionDate = updatedSheet?.date ?? updated.lastVersionDate;
    }

    return updated;
  },

  delete: async (id) => {
    const response = await httpClient.delete(`${PRODUCT_ENDPOINTS[0]}/${id}`);
    return unwrapResponse(response);
  },

  toggleActive: async (id) => {
    const response = await requestEndpointFallback(
      [`${PRODUCT_ENDPOINTS[0]}/${id}/status`, `${PRODUCT_ENDPOINTS[0]}/${id}/toggle-active`],
      { method: "PATCH", body: {} }
    );
    return toUiProduct(unwrapResponse(response), await getCategories());
  },

  getTechnicalSheetVersions: async (productId) => {
    const response = await requestEndpointFallback(getTechnicalSheetEndpoints(productId), { method: "GET" });
    return asArray(response).map(toUiSheet);
  },

  getTechnicalSheetById: async (productId, sheetId) => {
    const response = await requestEndpointFallback(
      [
        TECHNICAL_SHEET_ENDPOINTS.api.get(productId, sheetId),
        TECHNICAL_SHEET_ENDPOINTS.back.get(productId, sheetId),
      ],
      { method: "GET" }
    );
    return toUiSheet(unwrapResponse(response));
  },

  createTechnicalSheet: async (sheetData) => {
    const productId = sheetData.productId ?? sheetData.id_producto;
    const payloads = buildTechnicalSheetPayloads(productId, sheetData);
    const endpoints = createTechnicalSheetEndpoints(productId);
    let lastError;

    for (const endpoint of endpoints) {
      try {
        const response = await sendWithPayloadFallback(endpoint, "POST", payloads);
        return toUiSheet(unwrapResponse(response));
      } catch (error) {
        lastError = error;
        if (![404, 400, 422].includes(error?.status)) throw error;
      }
    }

    throw lastError;
  },

  updateTechnicalSheet: async (productId, sheetData) => {
    const versions = await productAPI.getTechnicalSheetVersions(productId).catch(() => []);
    const current = [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0];
    return productAPI.createTechnicalSheet({
      ...sheetData,
      productId,
      version: (current?.version ?? 0) + 1,
    });
  },

  deleteTechnicalSheet: async (productIdOrSheetId, maybeSheetId) => {
    const productId = maybeSheetId ? productIdOrSheetId : null;
    const sheetId = maybeSheetId ?? productIdOrSheetId;

    if (!productId) {
      throw new Error("Para eliminar una ficha tecnica se requiere productId y sheetId");
    }

    const response = await requestEndpointFallback(
      [
        TECHNICAL_SHEET_ENDPOINTS.api.delete(productId, sheetId),
        TECHNICAL_SHEET_ENDPOINTS.back.delete(productId, sheetId),
      ],
      { method: "DELETE" }
    );
    return unwrapResponse(response);
  },
};