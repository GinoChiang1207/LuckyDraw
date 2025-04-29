export interface Participant {
  email: string;
  uid: string;
  name: string;
  prize: string;
}

export interface RawParticipant {
  '邮箱'?: string;
  'email'?: string;
  'UID'?: string;
  'uid'?: string;
  '奖项'?: string;
  'prize'?: string;
  '姓名'?: string;
  'name'?: string;
}

export interface PrizeConfig {
  '特等奖': number;
  '一等奖': number;
  '二等奖': number;
  '幸运奖': number;
}

export type PrizeType = keyof PrizeConfig;

export const prizeOrder: Record<PrizeType, number> = {
  '特等奖': 0,
  '一等奖': 1,
  '二等奖': 2,
  '幸运奖': 3
};

export type PrizeOption = {
  value: PrizeType;
  label: string;
};

export const prizeOptions: PrizeOption[] = [
  { value: '特等奖', label: '特等奖' },
  { value: '一等奖', label: '一等奖' },
  { value: '二等奖', label: '二等奖' },
  { value: '幸运奖', label: '幸运奖' }
]; 