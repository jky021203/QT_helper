# Selah – 말씀 묵상 챗봇

Selah는 초신자도 쉽게 말씀 묵상을 시작할 수 있도록 돕는 GPT 기반 웹 애플리케이션입니다. 성경 구절을 입력하면 다음 다섯 단계를 순차적으로 제공합니다.

1. 배경 설명
2. 핵심 키워드
3. 관련 구절
4. 묵상 포인트
5. 한 줄 기도문

## 시작하기

### 요구 사항

- Node.js 18.17 이상
- npm 9 이상 (또는 pnpm/yarn 등 원하는 패키지 매니저)

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 열어 Selah를 확인할 수 있습니다.
모바일 기기에서도 테스트하려면 개발 머신과 동일한 네트워크에 연결한 뒤,
터미널에 표시되는 `http://<현재 IP>:3000` 주소로 접속하면 됩니다.
`npm run dev`는 실행 시 자동으로 로컬 네트워크 IP를 감지해 안내합니다.

### 환경 변수

실제 GPT 응답을 받으려면 프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가하세요.

```bash
OPENAI_API_KEY=sk-...
```

API 키가 설정되지 않은 경우 개발 편의를 위해 고정된 예시 응답을 반환합니다.

## 기술 스택

- Next.js (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- OpenAI GPT-4o-mini (Chat Completions)
- Zod (스키마 검증)
- LocalStorage (최근 묵상 3건 저장)

## 주요 기능

- 성경 구절 입력 및 검증
- GPT 기반 5단계 묵상 결과 생성
- 로딩 스켈레톤 및 오류 안내
- 최근 3건 히스토리 로컬 저장/복원
- 명상적인 톤앤매너 UI

## 배포

Vercel을 권장합니다. 환경 변수는 Vercel Project Settings > Environment Variables 에서 `OPENAI_API_KEY` 로 설정하면 됩니다.

## 개발 노트

- `app/api/lumi/route.ts` 는 Zod 스키마와 JSON Schema를 사용해 GPT 응답 구조를 엄격히 검증합니다.
- 폴백 응답이 필요한 경우 `fallbackResponse` 내용을 참고하세요.
- UI 컴포넌트는 `components/` 디렉터리에 분리되어 있으며 Tailwind 유틸리티 클래스로 스타일링되었습니다.

---

Selah와 함께 말씀 묵상의 첫 걸음을 내디뎌 보세요. 🙏
