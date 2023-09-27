class Role {
    constructor(name, level) {
        this.name = name;
        this.level = level;
    }
    hasPermission(minRole) {
        return this.level >= minRole.level;
    }
}

const
    GUEST = new Role("GUEST", 0),
    MEMBER = new Role("MEMBER", 10),
    EDITOR = new Role("EDITOR", 20),
    MODERATOR = new Role("MODERATOR", 50),
    ADMIN = new Role("ADMIN", 90),
    SUPERUSER = new Role("SUPERUSER", 100);

const roles = { GUEST, MEMBER, EDITOR, MODERATOR, ADMIN, SUPERUSER };

const roleNames = Object.keys(roles);
const roleValues = Object.values(roles);

function parseRole(role) {
    if (typeof(role) === "string") {
        return roles[role.toUpperCase()];
    } else if (typeof(role) === "object") {
        return role;
    }
    return null;
}

function roleToString(role) {
    if (typeof(role) === "string") {
        return role;
    } else if (typeof(role) === "object") {
        return role.name;
    }
    return null;
}

module.exports = {
    Role,
    parseRole,
    roleToString,
    roleNames,
    roleValues,
    roles
};