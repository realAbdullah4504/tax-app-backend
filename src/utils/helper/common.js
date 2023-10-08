exports.stringToNumber = (obj) => {
    const payload = {};
    for (const key in obj) {
      const numberWithComma = obj[key].includes(',');  
      if (obj[key] && !isNaN(obj[key]) || numberWithComma) {
        const stringWithoutCommas= numberWithComma && obj[key].replace(/,/g, '');
        payload[key] = numberWithComma ? +stringWithoutCommas:  +obj[key];
      } else {
        payload[key] = obj[key];
      }
    }
    return payload;
}