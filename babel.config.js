module.exports = api => {
  const isWebpack = api.caller(caller => caller?.name === 'babel-loader');

  return {
    presets: [
      [
        'module:@react-native/babel-preset',
        { disableImportExportTransform: isWebpack },
      ],
    ],
  };
};
