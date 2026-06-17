export const navigate = (to) => {
  window.location.hash = to;
};

export const getPath = () => window.location.hash || "#/";
