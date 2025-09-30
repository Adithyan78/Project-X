function createPurchase({ name, email, projectId, projectName, downloadLink, expiresAt }) {
    return {
        name,
        email,
        projectId,
        projectName,
        downloadLink,
        expiresAt,
        createdAt: new Date()
    };
}

module.exports = { createPurchase };
