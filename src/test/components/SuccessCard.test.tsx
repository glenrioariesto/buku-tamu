import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuccessCard from '@/components/visitor/SuccessCard';

describe('SuccessCard', () => {
  it('render pesan terima kasih', () => {
    render(<SuccessCard name="Budi Santoso" onReset={vi.fn()} />);
    expect(screen.getByText('Terima Kasih!')).toBeInTheDocument();
  });

  it('render teks Candi Dadi', () => {
    render(<SuccessCard name="Budi Santoso" onReset={vi.fn()} />);
    expect(screen.getByText(/Candi Dadi/)).toBeInTheDocument();
  });

  it('render tombol isi lagi', () => {
    render(<SuccessCard name="Budi Santoso" onReset={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Isi Lagi/i })).toBeInTheDocument();
  });

  it('panggil onReset saat tombol diklik', async () => {
    const onReset = vi.fn();
    render(<SuccessCard name="Budi Santoso" onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: /Isi Lagi/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
