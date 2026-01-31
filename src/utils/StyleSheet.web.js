// Simple StyleSheet mock for web compatibility
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  compose: (...styles) => Object.assign({}, ...styles.filter(Boolean)),
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  hairlineWidth: 1,
};

export default StyleSheet;