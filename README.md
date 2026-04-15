# 소개만 — 신뢰 기반 B2B 소개 매칭 플랫폼

> 운영사: 와이에이치솔루션 (YH Solution)  
> 관리자 계정: yhsol_ceo@yhsolution.co.kr / yhsol202503!@

---

## 📌 서비스 개요

소개만은 **세무사, 노무사, 공인중개사 등 신뢰 네트워크를 보유한 전문가(커넥터)**가  
**B2B 서비스·솔루션 기업(공급사)**과 잠재 고객을 연결해주는 플랫폼입니다.

### 비즈니스 흐름
1. 공급사가 아이템(서비스/솔루션)을 등록
2. 커넥터가 고객의 니즈를 파악해 적합한 아이템 선택
3. 고객 연락 동의 후 소개 요청 등록
4. 공급사가 직접 고객에게 연락해 영업 진행
5. 계약 성사 시 와이에이치솔루션이 파트너 보상을 반월 정산

---

## 🗂 페이지 구조

| 파일명 | 설명 | 접근 권한 |
|--------|------|-----------|
| `index.html` | 랜딩 페이지 | 누구나 |
| `login.html` | 로그인 | 누구나 |
| `dashboard-connector.html` | 커넥터 대시보드 | connector |
| `dashboard-supplier.html` | 공급사 대시보드 | supplier |
| `dashboard-admin.html` | 최고관리자 대시보드 | admin |
| `marketplace.html` | 아이템 탐색 | 로그인 후 |
| `item-request.html` | 아이템 신청 게시판 | 로그인 후 |

---

## 🔐 계정 정보

### 최고관리자 (와이에이치솔루션)
- **이메일**: yhsol_ceo@yhsolution.co.kr
- **비밀번호**: yhsol202503!@
- **권한**: 모든 기능 (회원, 아이템, 소개, 정산 관리)

### 테스트 커넥터 계정
| 이메일 | 비밀번호 | 직업 |
|--------|----------|------|
| connector1@test.com | test1234 | 세무사 |
| connector2@test.com | test1234 | 공인노무사 |

### 테스트 공급사 계정
| 이메일 | 비밀번호 | 회사 |
|--------|----------|------|
| supplier1@test.com | test1234 | 그로우파트너즈 |
| supplier2@test.com | test1234 | 테크맥스 주식회사 |

---

## 🗃 데이터 모델

### users (회원)
| 필드 | 설명 |
|------|------|
| id | 고유 ID |
| email | 로그인 이메일 |
| password | 비밀번호 |
| name | 이름 |
| role | admin / connector / supplier |
| company | 소속 회사 |
| phone | 연락처 |
| job_title | 직업/직위 |
| status | active / pending / suspended |
| bank_name/account/holder | 정산 계좌 정보 |
| total_reward | 누적 보상금액 |

### items (아이템)
| 필드 | 설명 |
|------|------|
| id | 고유 ID |
| supplier_id | 공급사 user ID |
| title | 아이템 제목 |
| category | 카테고리 |
| description | 상세 설명 |
| target_customer | 타겟 고객 |
| pain_point | 해결 페인포인트 |
| reward_rate | 보상률 (%) |
| reward_amount | 정액 보상 (원) |
| contract_avg | 평균 계약금액 |
| status | active / inactive / pending |

### referrals (소개 요청)
| 필드 | 설명 |
|------|------|
| id | 고유 ID |
| item_id | 연결 아이템 |
| connector_id | 소개 커넥터 |
| supplier_id | 공급사 |
| lead_company | 잠재고객 회사명 |
| lead_contact_name | 잠재고객 담당자 |
| lead_contact_phone | 연락처 |
| lead_situation | 고객 상황 설명 |
| consent_confirmed | 연락 동의 여부 |
| status | submitted → contact_requested → meeting_scheduled → proposal_sent → contracted / failed |
| reward_status | pending → approved → paid |
| contract_amount | 계약금액 |
| reward_amount | 파트너 보상금액 |

### settlements (정산)
| 필드 | 설명 |
|------|------|
| connector_id | 정산 대상 커넥터 |
| period | 정산 기간 |
| total_amount | 정산 총액 |
| status | scheduled / processing / completed |

### item_requests (아이템 신청)
| 필드 | 설명 |
|------|------|
| connector_id | 신청 커넥터 |
| title | 신청 제목 |
| category | 카테고리 |
| description | 상세 내용 |
| status | open / matched / closed |
| admin_memo | 관리자 메모 |

---

## ✅ 구현된 기능

### 커넥터
- [x] 대시보드 (통계, 최근 소개 현황)
- [x] 소개 요청 등록 (아이템 선택 + 고객 정보 + 동의 확인)
- [x] 내 소개 현황 조회 (검색/필터)
- [x] 소개 요청 상세 확인
- [x] 내 보상 현황 (지급완료/대기 금액)
- [x] 아이템 탐색 (마켓플레이스) → 직접 소개 요청 등록
- [x] 원하는 아이템 신청하기

### 공급사
- [x] 대시보드 (통계, 새 리드 알림)
- [x] 아이템 등록/수정/활성화 관리
- [x] 소개 리드 수신 및 영업 상태 관리
- [x] 계약 완료 처리 (계약금액 입력 → 보상 자동 계산)
- [x] 영업 메모 기록
- [x] 아이템 신청 게시판 열람

### 최고관리자 (와이에이치솔루션)
- [x] 전체 통계 대시보드 + 차트
- [x] 커넥터/공급사 회원 관리 (활성/정지)
- [x] 아이템 전체 관리 (활성/비활성화)
- [x] 소개 요청 전체 조회 및 보상 승인
- [x] 보상 정산 관리 (대기 → 승인 → 지급완료)
- [x] 아이템 신청 현황 관리 (메모, 상태 처리)

---

## 🚧 추후 개발 권장

1. **회원가입 페이지** - 커넥터/공급사 신규 가입 플로우
2. **비밀번호 해시화** - 현재는 평문 저장 (실서비스 전 반드시 개선)
3. **이메일 알림** - 소개 요청 수신 시 공급사 이메일 알림
4. **계좌 정보 관리** - 커넥터 정산 계좌 입력/변경 화면
5. **월별 정산 자동화** - 정산 스케줄러 자동 배치
6. **모바일 반응형 개선** - 사이드바 토글 완성
7. **파일 첨부** - 계약서 증빙 파일 업로드
8. **알림 센터** - 플랫폼 내 알림 기능

---

## 📅 정산 정책

- 정산일: 매월 1일, 16일
- 정산 기준: 계약 완료 + 보상 승인 건
- 운영사(와이에이치솔루션)가 파트너 보상을 직접 지급
- 세금계산서/원천징수 등은 운영 정책별 별도 처리

---

## ⚖️ 법적 고려사항

- 공급사 아이템은 일반 B2B 서비스/솔루션 기업에 한정
- 세무사법/공인노무사법 상 동종 자격사 수임 소개·알선은 별도 검토 필요
- 모든 소개는 고객의 명시적 연락 동의 후 진행 (개인정보 보호법 제17조)
- 플랫폼은 연결 중개만 수행, 계약 당사자 아님을 명시

---

*© 2025 소개만 by 와이에이치솔루션. All rights reserved.*
