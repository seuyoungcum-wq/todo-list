import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';
import { getTomorrowYYMMDD } from '../lib/format';

describe('App 통합 테스트 (오늘 남은 할 일 / 내일 해야 할 일, 카테고리, 날짜)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기 화면에 "오늘 남은 할 일"과 "내일 해야 할 일"이 렌더링된다', () => {
    render(<App />);

    expect(screen.getByText('오늘 남은 할 일')).toBeInTheDocument();
    expect(screen.getByText('내일 해야 할 일')).toBeInTheDocument();
  });

  it('범주(업무/개인/건강/취미)를 선택하고 할 일을 등록하면 해당 뱃지가 표시된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/오늘 어떤 일을 계획하고 있나요/i);

    // 입력 폼 내의 범주 선택 그룹에서 '건강' 버튼 선택
    const categoryGroup = screen.getByRole('group', { name: '할 일 범주 선택' });
    const healthButton = within(categoryGroup).getByRole('button', { name: '건강' });
    fireEvent.click(healthButton);

    fireEvent.change(input, { target: { value: '영양제 챙겨먹기' } });
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });

    // 목록에 항목과 카테고리 뱃지가 표시되는지 확인
    expect(screen.getByText('영양제 챙겨먹기')).toBeInTheDocument();
    const todoItem = screen.getByText('영양제 챙겨먹기').closest('li')!;
    expect(within(todoItem).getByText('건강')).toBeInTheDocument();
  });

  it('날짜를 YYMMDD 형태로 입력하여 내일 할 일을 등록하면 "내일 해야 할 일" 카운트가 증가한다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/오늘 어떤 일을 계획하고 있나요/i);
    const dateInput = screen.getByPlaceholderText('YYMMDD');
    const tomorrow = getTomorrowYYMMDD();

    // 날짜 입력
    fireEvent.change(dateInput, { target: { value: tomorrow } });

    // 할 일 텍스트 입력 및 등록
    fireEvent.change(input, { target: { value: '내일 발표 자료 검토' } });
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });

    // "내일 해야 할 일" 카운트 1개 확인
    expect(screen.getByText('내일 해야 할 일')).toBeInTheDocument();
    expect(screen.getByText('내일 발표 자료 검토')).toBeInTheDocument();
    expect(screen.getByText(/26\.\d\d\.\d\d \(내일\)/)).toBeInTheDocument();
  });

  it('완료 처리 시 "오늘 남은 할 일" 카운트가 감소한다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/오늘 어떤 일을 계획하고 있나요/i);

    fireEvent.change(input, { target: { value: '오늘 완료할 과제' } });
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // 체크박스 클릭
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText(/할 일 달성률 100%/i)).toBeInTheDocument();
  });

  it('삭제 후 토스트 알림에서 실행 취소를 클릭하면 원래 항목이 복원된다', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/오늘 어떤 일을 계획하고 있나요/i);
    fireEvent.change(input, { target: { value: '삭제할 테스트 항목' } });
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });

    const deleteBtn = screen.getByRole('button', { name: "할 일 '삭제할 테스트 항목' 삭제" });
    fireEvent.click(deleteBtn);

    expect(screen.queryByText('삭제할 테스트 항목')).not.toBeInTheDocument();

    const undoBtn = screen.getByRole('button', { name: '삭제한 할 일 복원하기' });
    fireEvent.click(undoBtn);

    expect(screen.getByText('삭제할 테스트 항목')).toBeInTheDocument();
  });
});
