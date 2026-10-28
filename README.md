# 내가 Orca를 사용하는 이유

사내 LLM API + OpenCode 환경에서 Orca를 사용하는 다섯 가지 이유를 설명하는 **20분 팀 밋업 강의노트**입니다. 공식 문서로 확인한 기능과 사내 환경에서 직접 확인할 조건을 함께 설명합니다.

- 강의 사이트: [Why Orca](https://tell-me-W.github.io/why-orca/)
- 저장소: [tell-me-W/why-orca](https://github.com/tell-me-W/why-orca)
- 기능 조사 기준일: **2026-10-29**
- 배포 대상: **main 브랜치의 /docs**
- 형식: 목차 · 본문 · 소목차로 구성한 정적 교재 사이트

[프로젝트로 배우는 딥러닝](https://codingalzi.github.io/code-workout-dlp/)의 교재형 화면 구성을 참고했습니다. 콘텐츠·로고·코드는 복제하지 않았습니다.

## 강의 구성

| 페이지 | 내용 | 발표 구간 |
| --- | --- | --- |
| 강의 안내 | 표지, 목표, 읽는 순서 | 시작 화면 |
| 다섯 가지 사용 이유 | 사내 API · OpenCode · Orca 역할 | 0:00–1:00 |
| Git worktree 이해 | 작업 공간 분리와 공유 이력 | 1:00–4:00 |
| 스킬과 오케스트레이션 | 병렬 배정, 의존 관계, 완료 보고 | 4:00–7:00 |
| 터미널과 상태 추적 | 완료·응답 대기·중단 상태 확인 | 7:00–9:00 |
| Diff 검토와 피드백 | Annotate와 의견 일괄 전달 | 9:00–11:00 |
| 세션 복구와 이력 | 복원·재시작·대화 재개 구분 | 11:00–12:00 |
| 브라우저와 Design Mode | 요소 선택과 UI 수정·검증 | 12:00–14:00 |
| 실사용 사례 | 발표자가 직접 작성 | 14:00–18:00 |
| 정리와 팩트체크 | 15개 주장 검증, 출처, Q&A | 18:00–20:00 |
| 부록 · 업무 적용 | 작업 명세와 검토 책임 | 발표 후 읽을거리 |

설명 14분, 사례 4분, 정리와 질문 2분입니다. 실사용 사례와 성과 수치는 발표자가 작성합니다. 아직 작성하지 않은 사례는 빈 양식으로 남겨 두었습니다.

## 팩트체크에서 구분한 내용

- OpenCode 실행과 상태 연동은 공식 지원 기능입니다. 사내 API·변경판의 모든 조합을 보장하지는 않습니다.
- 멈춤 대응은 상태와 출력을 보고 조치하는 흐름입니다. 임의의 장애를 자동 진단·복구한다는 주장은 넣지 않았습니다.
- Session restore는 화면과 출력 기록, 살아 있는 프로세스의 재연결을 다룹니다. Restart와 저장된 대화의 Resume는 별도입니다.
- Design Mode는 요소 정보를 에이전트에 전달해 소스 수정을 요청합니다. 수정 후 화면과 Diff를 검토합니다.
- 오케스트레이션은 실험 기능이며 실행 중인 Orca runtime이 필요합니다. 세부 실행 옵션은 설치 버전의 guide를 확인합니다.

각 장의 주장 가까이에 공식 출처를 달았습니다. 전체 판정표는 [팩트체크 페이지](https://tell-me-W.github.io/why-orca/references.html#fact-check)에 있습니다.

## 기술과 디렉터리

HTML, CSS, JavaScript로 만들었습니다. 브라우저에서 외부 라이브러리, CDN, 서버 API를 사용하지 않습니다. Node.js 기본 모듈로 본문과 공통 레이아웃을 결합하므로 npm 설치가 필요 없습니다.

```text
content/            # 수정할 강의 본문 HTML
assets/             # 공통 CSS와 브라우저 JavaScript
templates/page.html # 공통 레이아웃
site.json           # 제목, 목차, 발표 구간
scripts/build.mjs   # 정적 문서 생성
scripts/check.mjs   # 링크·앵커·배포 파일 검사
scripts/serve.mjs   # 로컬 미리보기
docs/               # GitHub Pages 게시 파일
```

소스와 생성된 `docs/`를 함께 Git에 저장합니다. `docs/`를 직접 고치면 다음 빌드 때 덮어씁니다.

## 로컬 실행

Node.js 20 이상에서 프로젝트 폴더를 열고 실행합니다.

```powershell
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

[http://127.0.0.1:4173/](http://127.0.0.1:4173/)에서 확인합니다. **접속하는 동안 서버 터미널을 켜 두어야 합니다.** 종료는 Ctrl+C입니다. 본문 수정 후에는 build 명령을 다시 실행하고 새로고침합니다.

GitHub 프로젝트 경로를 미리 검증하려면 다음처럼 실행합니다.

```powershell
node scripts/serve.mjs --port 4174 --base /why-orca/
```

주소는 `http://127.0.0.1:4174/why-orca/`입니다.

## 강의 수정

- 본문: `content/`의 해당 HTML 파일
- 제목·순서·시간: `site.json`
- 실사용 사례: `content/examples.html`
- 팩트체크·출처: `content/references.html`
- 발표자 메모: 각 본문의 `details.speaker-notes`
- 소목차: 고유한 영문 `id`가 있는 `h2`·`h3`에서 자동 생성
- 이미지: `assets/images/`에 저장한 뒤 `assets/images/파일명`으로 참조

사례에는 사내 환경에서 실제로 동작한 범위, 사람이 개입한 이유, 검증 결과를 적습니다. 공개 자료에는 API 키나 내부 주소를 포함하지 않습니다.

## GitHub Pages 배포

저장소의 **Settings → Pages → Build and deployment**에서 다음을 사용합니다.

| 설정 | 값 |
| --- | --- |
| Source | Deploy from a branch |
| Branch | main |
| Folder | /docs |

`docs/.nojekyll`로 Jekyll 처리를 생략합니다. 생성 파일의 상대 경로는 `/why-orca/` 아래에서도 동작합니다. 커스텀 `.github/workflows/` 파일은 사용하지 않습니다.

변경을 게시하는 순서는 다음과 같습니다.

```powershell
node scripts/build.mjs
node scripts/check.mjs
git add README.md site.json content assets templates scripts docs
git commit -m "Update Orca lecture notes"
git push origin main
```

브랜치 배포도 GitHub 내부에서는 Pages 배포용 Actions 실행으로 표시될 수 있습니다. 여기서 “Actions 없이”는 별도 워크플로를 작성하거나 CI에서 사이트를 빌드하지 않는다는 뜻입니다. [GitHub 공식 배포 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 주요 공식 자료

- [Orca 공식 문서](https://www.onorca.dev/docs)
- [Orca 공식 저장소](https://github.com/stablyai/orca)
- [OpenCode providers](https://opencode.ai/docs/providers/)
- [Git worktree](https://git-scm.com/docs/git-worktree)
- [주장별 확인 결과와 전체 출처](content/references.html)
