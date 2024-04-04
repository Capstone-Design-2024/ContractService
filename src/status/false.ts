export const badRequest = {
  error: "400 Bad Request",
  message: "올바르지 못한 데이터 타입입니다.",
};

export const badRequestBlockChain = (reason: string) => {
  return {
    error: "400 Bad Request",
    message: "올바르지 못한 데이터 타입입니다.",
    reason,
  };
};

export const notFound = {
  error: "404 Not Found",
  message: "존재하지 않는 데이터에 대한 조회입니다.",
};

export const unAuthorized = {
  error: "401 Unauthorized",
  message: "올바르지 않은 인증 정보입니다.",
};

export const notMatchedMnemonic = {
  error: "401 Unauthorized",
  message: "본인의 니모닉 문자열이 아닙니다.",
};

export const insufficientReIssueTokenChance = {
  error: "400 Bad Request",
  message: "유저가 존재하지 않거나 토큰재발행횟수를 초과했습니다.",
};

export const notOwnerOfWallet = {
  error: "401 Unauthorized",
  message: "본인의 지갑 주소가 아닙니다.",
};
