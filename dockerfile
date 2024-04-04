# 1단계: Node.js 18.16.0 버전의 기본 이미지 선택
FROM node:18.16.0

# 2단계: 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3단계: 의존성 파일 복사 및 설치
# package.json과 package-lock.json을 복사
COPY package*.json ./

# npm을 이용해 의존성 설치
RUN npm install

# TypeScript 글로벌 설치 (필요한 경우)
# RUN npm install -g typescript

# 4단계: 프로젝트 파일 복사
COPY . .


# 6단계: 실행 명령 설정
CMD ["npm", "run", "dev"]
