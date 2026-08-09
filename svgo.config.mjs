/**
 * The illustrations are decorative and never render wider than ~220 CSS px,
 * so sub-pixel path precision is wasted bytes. Precision 1 is visually
 * indistinguishable at that size and roughly halves the file.
 */
export default {
  multipass: true,
  floatPrecision: 1,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertPathData: { floatPrecision: 1 },
          cleanupNumericValues: { floatPrecision: 1 },
          // Keep viewBox so the SVGs stay responsive to their CSS box.
          removeViewBox: false
        }
      }
    },
    'removeDimensions',
    'sortAttrs'
  ]
};
