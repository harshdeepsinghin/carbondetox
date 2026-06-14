import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges tailwind classes and resolves conflicts correctly', () => {
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('flex items-center', 'justify-between')).toBe(
      'flex items-center justify-between',
    );
    expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
  });
});
