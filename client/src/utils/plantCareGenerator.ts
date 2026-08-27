// utils/plantCareGenerator.ts
import type { PlantbookPlant, PlantCare } from '../types/plantbook.types';

//Генерация рекомендаций по уходу
export const generatePlantCare = (data: PlantbookPlant): PlantCare => {
  const care: PlantCare = {
    light: generateLightRecommendation(data),
    humid: generateHumidityRecommendation(data),
    soil: generateSoilRecommendation(data),
  };
  
  return care;
};

//Генерация рекомендаций по освещению
const generateLightRecommendation = (data: PlantbookPlant): string => {
  const { min_light_lux, max_light_lux, min_light_mmol, max_light_mmol } = data;
  
  const avgLux = min_light_lux && max_light_lux ? (min_light_lux + max_light_lux) / 2 : null;
  const avgMmol = min_light_mmol && max_light_mmol? (min_light_mmol + max_light_mmol) / 2 : null;
  const lightLevel = avgLux !== null ? avgLux : avgMmol;

  let recommendation = '';
  let placement = '';

  if (lightLevel !== null) {
    if (lightLevel < 500) {
      recommendation = 'Теневыносливое растение';
      placement = 'располагать в затененных местах, вдали от прямых солнечных лучей';
    } else if (lightLevel < 2500) {
      recommendation = 'Предпочитает полутень';
      placement = 'располагать в месте с ярким, но рассеянным светом';
    } else if (lightLevel < 10000) {
      recommendation = 'Светолюбивое растение';
      placement = 'размещать на хорошо освещенных местах, но защищать от полуденного солнца';
    } else {
      recommendation = 'Очень светолюбивое растение';
      placement = 'размещать на самом светлом месте, под прямыми солнечными лучами';
    }
  } else {
    recommendation = 'Умеренное освещение';
    placement = 'располагать в хорошо освещенном месте с рассеянным светом';
  }

  let details = '';
  if (min_light_lux && max_light_lux) {
    details = ` (оптимальный диапазон: ${min_light_lux}–${max_light_lux} люкс)`;
  } else if (min_light_mmol && max_light_mmol) {
    details = ` (оптимальный диапазон: ${min_light_mmol}–${max_light_mmol} µmol/m²/день)`;
  }

  return `${recommendation}, ${placement}.\n${details}`;
};

//Генерация рекомендаций по влажности
const generateHumidityRecommendation = (data: PlantbookPlant): string => {
  const { min_env_humid, max_env_humid, min_soil_moist, max_soil_moist } = data;

  const avgHumid = min_env_humid && max_env_humid? (min_env_humid + max_env_humid) / 2: null;
  const avgSoilMoist = min_soil_moist && max_soil_moist? (min_soil_moist + max_soil_moist) / 2: null;

  let airRecommendation = '';
  let soilRecommendation = '';

  if (avgHumid !== null) {
    if (avgHumid < 40) {
      airRecommendation = 'Предпочитает сухой воздух, не требует опрыскивания';
    } else if (avgHumid < 60) {
      airRecommendation = 'Предпочитает умеренную влажность воздуха';
    } else {
      airRecommendation = 'Предпочитает высокую влажность воздуха, требует регулярного опрыскивания';
    }
  } else {
    airRecommendation = 'Предпочитает умеренную влажность воздуха';
  }

  if (avgSoilMoist !== null) {
    if (avgSoilMoist < 30) {
      soilRecommendation = 'почва должна быть рыхлой и хорошо дренированной, полив умеренный, давать почве подсыхать';
    } else if (avgSoilMoist < 60) {
      soilRecommendation = 'почва должна быть равномерно влажной, не допускать пересыхания или переувлажнения';
    } else {
      soilRecommendation = 'почва должна быть постоянно влажной, не допускать пересыхания';
    }
  } else {
    soilRecommendation = 'поддерживать умеренную влажность почвы, избегать застоя воды';
  }

  let details = ''
  if (min_env_humid && max_env_humid) {
    details += ` (оптимальная влажность воздуха: ${min_env_humid}–${max_env_humid}%)`;
  }
  if (min_soil_moist && max_soil_moist) {
    details += `\n (оптимальная влажность почвы: ${min_soil_moist}–${max_soil_moist}%)`;
  }

  return `${airRecommendation}, ${soilRecommendation} ${details}.`;
};

//Генерация рекомендаций по почве
const generateSoilRecommendation = (data: PlantbookPlant): string => {
  const { min_soil_moist, max_soil_moist, min_soil_ec, max_soil_ec } = data;

  const avgMoist = min_soil_moist && max_soil_moist ? (min_soil_moist + max_soil_moist) / 2 : null;
  let soilRecommendation = '';

  if (avgMoist !== null) {
    if (avgMoist > 60) {
      soilRecommendation = 'Предпочитает влагоемкую почву с высоким содержанием органики (торф, кокосовое волокно)';
    } else if (avgMoist < 30) {
      soilRecommendation = 'Предпочитает легкую, хорошо дренированную почву с примесью песка или перлита';
    } else {
      soilRecommendation = 'Предпочитает рыхлую, питательную почву с хорошим дренажем';
    }
  } else {
    soilRecommendation = 'Предпочитает рыхлую, питательную почву с хорошим дренажем';
  }

  const avgEc = min_soil_ec && max_soil_ec ? (min_soil_ec + max_soil_ec) / 2 : null;

  let ecAdvice = '';
  if (avgEc !== null) {
    if (avgEc < 500) {
      ecAdvice = 'Удобряйте редко, используйте разбавленные растворы, чтобы не навредить.';
    } else if (avgEc > 2000) {
      ecAdvice = 'Удобряйте регулярно, но следите за концентрацией, не используйте слишком много удобрений.';
    } else {
      ecAdvice = 'Удобряйте регулярно в период активного роста, используя сбалансированные комплексные удобрения.';
    }
  }

  return `${soilRecommendation}. ${ecAdvice}`;
};