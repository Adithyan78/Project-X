function createProject({ name, type, price, description, fileUrl }) {
  return {
    name: name || "",
    type: type || "",
    price: price || 0,
    description: description || "",
    fileUrl: fileUrl || ""
  };
}

module.exports = { createProject };
