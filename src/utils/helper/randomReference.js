exports.generateRandomReferenceId = (userId) => {
  const randomPart = Math.floor(100 + Math.random() * 900);

  const referenceID = `transfer-${userId}-${randomPart}`;

  return referenceID;
};
