import service from "./request";
const homeRecommend = "/app/good/getGoodRecommend"; //首页推荐接口
const select = "/app/good/app/selectApp";

// 首页推荐
export const getRecommend = () => {
  return service.post(homeRecommend);
};

export const getSelect = (data) => {
  return service.post(select, { page: 1, limit: 100, ...data });
};
