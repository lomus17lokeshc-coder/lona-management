/*
 * login.c – Lona Library CGI
 * Validates admin or student login.
 * POST fields: role, userid, password
 * Response: JSON { "status": "ok"|"fail", "role": "...", "name": "...", ... }
 *
 * Data formats:
 *   admins.txt  : id|password
 *   users.txt   : id|name|dept|sem|password
 */

#include "common.h"

static int check_admin(const char *id, const char *pass) {
    FILE *f = fopen(ADMINS_FILE, "r");
    if (!f) {
        /* fallback hardcoded default */
        return (strcmp(id,"ADM001")==0 && strcmp(pass,"admin123")==0);
    }
    char line[MAX_LINE];
    while (fgets(line, MAX_LINE, f)) {
        char sid[MAX_STR], spwd[MAX_STR];
        if (sscanf(line, "%127[^|]|%127s", sid, spwd) == 2) {
            if (strcmp(sid, id)==0 && strcmp(spwd, pass)==0) {
                fclose(f);
                return 1;
            }
        }
    }
    fclose(f);
    return 0;
}

static int check_student(const char *id, const char *pass,
                          char *out_name, char *out_dept, int *out_sem) {
    FILE *f = fopen(USERS_FILE, "r");
    if (!f) return 0;
    char line[MAX_LINE];
    while (fgets(line, MAX_LINE, f)) {
        char sid[MAX_STR], sname[MAX_STR], sdept[MAX_STR], spwd[MAX_STR];
        int  sem = 0;
        if (sscanf(line, "%127[^|]|%127[^|]|%127[^|]|%d|%127s",
                   sid, sname, sdept, &sem, spwd) == 5) {
            if (strcmp(sid, id)==0 && strcmp(spwd, pass)==0) {
                strncpy(out_name, sname, MAX_STR);
                strncpy(out_dept, sdept, MAX_STR);
                *out_sem = sem;
                fclose(f);
                return 1;
            }
        }
    }
    fclose(f);
    return 0;
}

int main(void) {
    char body[MAX_LINE*4];
    read_post_body(body, sizeof(body));

    char role[MAX_STR], userid[MAX_STR], password[MAX_STR];
    get_post_field(body, "role",     role,     MAX_STR);
    get_post_field(body, "userid",   userid,   MAX_STR);
    get_post_field(body, "password", password, MAX_STR);

    cgi_json_header();

    if (strcmp(role, "admin") == 0) {
        if (check_admin(userid, password)) {
            printf("{\"status\":\"ok\",\"role\":\"admin\",\"id\":\"%s\",\"name\":\"Administrator\"}", userid);
        } else {
            printf("{\"status\":\"fail\",\"message\":\"Invalid admin credentials\"}");
        }
    } else {
        char name[MAX_STR] = "", dept[MAX_STR] = "";
        int  sem = 0;
        if (check_student(userid, password, name, dept, &sem)) {
            char ename[MAX_STR*2], edept[MAX_STR*2];
            json_escape(ename, name, sizeof(ename));
            json_escape(edept, dept, sizeof(edept));
            printf("{\"status\":\"ok\",\"role\":\"user\",\"id\":\"%s\","
                   "\"name\":\"%s\",\"dept\":\"%s\",\"sem\":%d}",
                   userid, ename, edept, sem);
        } else {
            printf("{\"status\":\"fail\",\"message\":\"Invalid student credentials\"}");
        }
    }
    return 0;
}
