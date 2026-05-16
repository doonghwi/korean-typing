# 한글 타자 연습 (korean-typing)

두벌식 한글 타자 연습 웹앱. 손가락 위치 가이드와 함께. iPad에서도 동작 (블루투스 키보드 필요).

🔗 https://doonghwi.github.io/korean-typing/

## 왜 만들었나

- TypingClub은 한글 입력이 안 됨
- iPad용 무료 타자 앱이 사실상 없음
- 손가락 위치를 시각적으로 알려주는 도구가 부족

## 스택

- Vite + React + TypeScript
- 자체 한글 조합 엔진 (브라우저 IME 우회, 키 단위 채점)
- 진행 기록은 `localStorage` (서버 없음)
- GitHub Pages로 배포

## 개발

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치 푸시 시 GitHub Actions가 자동으로 GitHub Pages에 배포.

## iPad 사용

iPad의 화면 키보드는 자동완성/예측 때문에 키 단위 연습이 어렵습니다.
**블루투스 키보드 연결 후 Safari로 접속**하세요.
