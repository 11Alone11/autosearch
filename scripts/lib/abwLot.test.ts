import { describe, expect, it } from 'vitest';
import { parseMileage, splitMakeAndModel } from './abwLot';

describe('splitMakeAndModel', () => {
  it('делит марку и модель по слагу', () => {
    expect(splitMakeAndModel('/cars/detail/bmw/x5/1', 'BMW X5 I, 2020')).toEqual({
      make: 'BMW',
      model: 'X5 I',
    });
  });

  it('понимает составную марку из двух слов', () => {
    expect(
      splitMakeAndModel(
        '/cars/detail/land-rover/range-rover/1',
        'Land Rover Range Rover Sport III, 2020',
      ),
    ).toEqual({ make: 'Land Rover', model: 'Range Rover Sport III' });
  });

  it('не разрывает марку через дефис', () => {
    expect(
      splitMakeAndModel(
        '/cars/detail/rolls-royce/silver-spirit/1',
        'Rolls-Royce Silver Spirit Mark I, 1982',
      ),
    ).toEqual({ make: 'Rolls-Royce', model: 'Silver Spirit Mark I' });
  });

  it('убирает рестайлинг и код поколения из модели', () => {
    expect(
      splitMakeAndModel('/cars/detail/vaz/vesta/1', 'LADA (ВАЗ) Vesta I Рестайлинг (NG), 2018'),
    ).toEqual({ make: 'LADA', model: 'Vesta I' });
    expect(
      splitMakeAndModel(
        '/cars/detail/mercedes/clk-klasse/1',
        'Mercedes-Benz CLK-klasse I (W208) Рестайлинг, 1999',
      ),
    ).toEqual({ make: 'Mercedes-Benz', model: 'CLK-klasse I' });
  });
});

describe('parseMileage', () => {
  it('достаёт пробег из строки', () => {
    expect(parseMileage(['215 000 км', 'механика'])).toBe(215_000);
  });

  it('возвращает null, если пробега нет', () => {
    expect(parseMileage(['', 'механика'])).toBeNull();
  });
});
