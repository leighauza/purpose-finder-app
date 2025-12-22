// lib/mapProkerala.ts

export type VedicCharts = {
  d1_rasi_chart: any;
  d9_navamsa_chart: any;
  d10_dasamsa_chart: any;
  planetary_positions: any;
  houses: any;
  nakshatras: any;
  vimshottari_dasha: any;
  ayanamsa_value: number;
  ayanamsa_type: string;
};

type MapInput = {
  birthDetails: any;
  d9: any;
  d10: any;
  dashas: any;
  ayanamsa: number;
};

export const mapProkeralaToVedicCharts = (
  input: MapInput
): VedicCharts => {
  const { birthDetails, d9, d10, dashas, ayanamsa } = input;

  return {
    d1_rasi_chart: birthDetails,
    d9_navamsa_chart: d9,
    d10_dasamsa_chart: d10,
    planetary_positions: birthDetails,
    houses: birthDetails,
    nakshatras: birthDetails,
    vimshottari_dasha: dashas,
    ayanamsa_value: ayanamsa,
    ayanamsa_type: 'LAHIRI',
  };
};
