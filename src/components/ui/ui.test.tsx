import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus, Wrench } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import {
  Button,
  Checkbox,
  Field,
  FileField,
  IconButton,
  OptionCard,
  SectionTitle,
  SelectableChip,
  SimulationNotice,
  StatusText,
} from '.';

describe('Button', () => {
  it('é um botão do tipo "button" com variante e ícone decorativo', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" icon={Plus} onClick={onClick}>
        Novo Processo
      </Button>
    );
    const botao = screen.getByRole('button', { name: 'Novo Processo' });
    expect(botao).toHaveAttribute('type', 'button');
    expect(botao).toHaveClass('ui-button', 'ui-button--primary');
    expect(botao.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(botao);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('usa "secondary" por padrão e respeita disabled', () => {
    render(<Button disabled>Cancelar</Button>);
    const botao = screen.getByRole('button', { name: 'Cancelar' });
    expect(botao).toHaveClass('ui-button--secondary');
    expect(botao).toBeDisabled();
  });
});

describe('IconButton', () => {
  it('tem nome acessível e dica iguais ao rótulo', () => {
    render(<IconButton icon={Wrench} label="Editar processo" />);
    const botao = screen.getByRole('button', { name: 'Editar processo' });
    expect(botao).toHaveAttribute('title', 'Editar processo');
    expect(botao).toHaveClass('ui-icon-button');
  });

  it('variante danger para ações destrutivas', () => {
    render(<IconButton icon={Wrench} label="Remover" variant="danger" />);
    expect(screen.getByRole('button', { name: 'Remover' })).toHaveClass(
      'ui-icon-button--danger'
    );
  });
});

describe('Field', () => {
  it('associa rótulo, obrigatório, dica e erro ao controle', () => {
    render(
      <Field
        id="nome-do-processo"
        label="Nome do processo"
        required
        hint="Aparece no catálogo."
        error="Informe o nome do processo."
      >
        {(controle) => <input {...controle} />}
      </Field>
    );
    const input = screen.getByRole('textbox', { name: /Nome do processo/ });
    expect(input).toHaveAttribute('id', 'nome-do-processo');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute(
      'aria-describedby',
      'nome-do-processo-dica nome-do-processo-erro'
    );
    expect(input).toBeRequired();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Informe o nome do processo.'
    );
    expect(screen.getByText('(obrigatório)')).toHaveClass('sr-only');
  });

  it('sem erro, não marca o controle como inválido', () => {
    render(
      <Field id="descricao" label="Descrição">
        {(controle) => <textarea {...controle} />}
      </Field>
    );
    const campo = screen.getByRole('textbox', { name: 'Descrição' });
    expect(campo).not.toHaveAttribute('aria-invalid');
    expect(campo).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('FileField', () => {
  it('mostra o nome do arquivo escolhido e devolve o File', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <FileField
        id="principal-1"
        file={null}
        placeholder="Selecionar arquivo…"
        onChange={onChange}
        aria-label="Principal 1"
      />
    );
    expect(screen.getByText('Selecionar arquivo…')).toBeInTheDocument();
    const arquivo = new File(['x'], 'base.xlsx');
    await userEvent.upload(screen.getByLabelText('Principal 1'), arquivo);
    expect(onChange).toHaveBeenCalledWith(arquivo);
    rerender(
      <FileField
        id="principal-1"
        file={arquivo}
        placeholder="Selecionar arquivo…"
        onChange={onChange}
        aria-label="Principal 1"
      />
    );
    expect(screen.getByText('base.xlsx')).toBeInTheDocument();
  });
});

describe('OptionCard', () => {
  it('é um botão com estado pressionado', async () => {
    const onSelect = vi.fn();
    render(
      <OptionCard
        icon={Wrench}
        title="Criar com ferramentas"
        description="Monte um processo."
        selected
        onSelect={onSelect}
      />
    );
    const opcao = screen.getByRole('button', { name: /Criar com ferramentas/ });
    expect(opcao).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(opcao);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe('SectionTitle', () => {
  it('renderiza o nível de título pedido com passo opcional', () => {
    render(
      <SectionTitle
        as="h2"
        step={2}
        title="Arquivos principais"
        description="Até 2 arquivos."
      />
    );
    expect(
      screen.getByRole('heading', { level: 2, name: /Arquivos principais/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Até 2 arquivos.')).toBeInTheDocument();
  });
});

describe('SimulationNotice', () => {
  it('usa sempre o termo "Simulação"', () => {
    render(<SimulationNotice detail="Nenhum arquivo é processado." />);
    const aviso = screen.getByText('Simulação');
    expect(aviso.closest('.ui-simulation')).toHaveAttribute(
      'title',
      'Nenhum arquivo é processado.'
    );
  });
});

describe('StatusText', () => {
  it.each([
    ['concluido', 'Concluído'],
    ['atencao', 'Atenção'],
    ['erro', 'Erro'],
  ] as const)('%s → %s', (status, texto) => {
    render(<StatusText status={status} />);
    expect(screen.getByText(texto)).toHaveClass(`ui-status--${status}`);
  });
});

describe('Checkbox', () => {
  it('é um checkbox nativo com rótulo e descrição', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox
        label="Linhas processadas"
        description="Total por etapa"
        checked={false}
        onChange={onChange}
      />
    );
    const caixa = screen.getByRole('checkbox', { name: /Linhas processadas/ });
    await userEvent.click(caixa);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('SelectableChip', () => {
  it('alterna seleção com aria-pressed', async () => {
    const onToggle = vi.fn();
    render(
      <SelectableChip selected={false} onToggle={onToggle}>
        CPF
      </SelectableChip>
    );
    const chip = screen.getByRole('button', { name: 'CPF' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
