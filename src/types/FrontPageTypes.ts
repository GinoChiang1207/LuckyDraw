export interface Participant {
  // email: string;
  uid: string;
  name: string;
  prize: string;
}

export interface RawParticipant {
  '姓名'?: string;
  'name'?: string;
  'UID'?: string;
  'uid'?: string;
//   'email'?: string;
  '奖项'?: string;
  'prize'?: string;
}

export interface Winner {
  name: string;
  uid: string;
  prize: string;
}

export const STORAGE_KEYS = {
  PARTICIPANTS: 'token2049_participants',
  WINNERS: 'token2049_winners',
  PRIZE_CONFIG: 'token2049_prize_config'
} as const; 