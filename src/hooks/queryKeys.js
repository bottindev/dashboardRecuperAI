export const queryKeys = {
  clients: {
    all: () => ["clients"],
    list: () => ["clients", "list"],
    detail: (id) => ["clients", "detail", id],
  },
  metrics: {
    all: () => ["metrics"],
    list: () => ["metrics", "list"],
    byClient: (clientId) => ["metrics", "byClient", clientId],
  },
  overview: {
    all: () => ["overview"],
    data: () => ["overview", "data"],
  },
  pipeline: {
    all: () => ["pipeline"],
    leads: () => ["pipeline", "leads"],
  },
  configClientes: {
    all: () => ["configClientes"],
    list: () => ["configClientes", "list"],
  },
  reports: {
    all: () => ["reports"],
    data: () => ["reports", "data"],
  },
};
