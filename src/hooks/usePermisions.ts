/**
 * 检查用户是否有权限进行某个操作的钩子
 * @usage 先向权限列表添加权限值，然后在组件中调用 checkPermissions 钩子，传入所需权限（或数组）和回调函数，组件会根据用户是否拥有权限决定是否执行回调函数或拒绝函数
 */

// 用户权限列表，动态添加
let userPermissions_: string[] = [];

// 默认权限
let defaultPermission_: string | null = null;

// 默认权限拒绝函数
let rejectCallback_: Function = () => {};

// 初始化权限列表，默认权限
function initPermissions(permissions: string[]) {
  userPermissions_ = permissions;
}

// 检查权限是否存在
function hasPermission(
  requiredPermissions: string[] | string,
  permission: string[] | string
) {
  if (Array.isArray(permission)) {
    return permission.every((p) => requiredPermissions.includes(p));
  }

  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.includes(permission);
  }

  return permission === requiredPermissions;
}

// 设置默认拒绝函数
function setDefaultRejectCallback(callback: Function) {
  rejectCallback_ = callback;
}

// 设置默认权限
function setDefaultPermission(permission: string | null) {
  defaultPermission_ = permission;
}

// 钩子函数
function checkPermissions(
  requiredPermissions: string[] | string,
  callback: Function,
  reject?: Function
) {
  let reject_ = reject || rejectCallback_;

  // 所需权限检查合法性
  if (!hasPermission(userPermissions_, requiredPermissions)) {
    throw new Error("权限不合法");
  }

  // 无权限或权限检查失败
  if (
    !defaultPermission_ ||
    !hasPermission(requiredPermissions, defaultPermission_)
  ) {
    console.log("权限检查失败");
    reject_();
    return;
  }

  // 执行回调函数
  callback();
}

export {
  initPermissions,
  setDefaultRejectCallback,
  setDefaultPermission,
  checkPermissions,
};
