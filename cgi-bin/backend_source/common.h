/*
 * common.h – Lona Library CGI Backend
 * Shared definitions, data structures, and helpers.
 */

#ifndef COMMON_H
#define COMMON_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* ─── File paths ─── */
#define BOOKS_FILE    "data/books.txt"
#define USERS_FILE    "data/users.txt"
#define ISSUED_FILE   "data/issued.txt"
#define ADMINS_FILE   "data/admins.txt"

/* ─── Field sizes ─── */
#define MAX_STR   128
#define MAX_LINE  512

/* ─── Fine rate ─── */
#define FINE_PER_DAY 1

/* ─── Structures ─── */
typedef struct {
    int  id;
    char title[MAX_STR];
    char author[MAX_STR];
    char category[MAX_STR];
    char dept[MAX_STR];
    int  sem;
    int  qty;
    int  issued;
} Book;

typedef struct {
    char id[MAX_STR];
    char name[MAX_STR];
    char dept[MAX_STR];
    int  sem;
    char password[MAX_STR];
} Student;

typedef struct {
    char issueId[MAX_STR];
    char studentId[MAX_STR];
    int  bookId;
    char issueDate[MAX_STR];
    char dueDate[MAX_STR];
    int  returned;   /* 0 = active, 1 = returned */
} IssuedBook;

typedef struct {
    char id[MAX_STR];
    char password[MAX_STR];
} Admin;

/* ─── CGI header helpers ─── */
static void cgi_json_header(void) {
    printf("Content-Type: application/json\r\n\r\n");
}

static void cgi_text_header(void) {
    printf("Content-Type: text/plain\r\n\r\n");
}

static void cgi_html_header(void) {
    printf("Content-Type: text/html\r\n\r\n");
}

/* ─── URL decode (simple) ─── */
static void url_decode(char *dst, const char *src, int max) {
    int i = 0, j = 0;
    while (src[i] && j < max - 1) {
        if (src[i] == '%' && src[i+1] && src[i+2]) {
            char hex[3] = { src[i+1], src[i+2], '\0' };
            dst[j++] = (char)strtol(hex, NULL, 16);
            i += 3;
        } else if (src[i] == '+') {
            dst[j++] = ' ';
            i++;
        } else {
            dst[j++] = src[i++];
        }
    }
    dst[j] = '\0';
}

/* ─── Parse POST field from query string ─── */
static int get_post_field(const char *body, const char *field, char *out, int max) {
    char key[MAX_STR];
    snprintf(key, MAX_STR, "%s=", field);
    const char *p = strstr(body, key);
    if (!p) { out[0] = '\0'; return 0; }
    p += strlen(key);
    const char *end = strchr(p, '&');
    int len = end ? (int)(end - p) : (int)strlen(p);
    if (len >= max) len = max - 1;
    char raw[MAX_STR];
    strncpy(raw, p, len);
    raw[len] = '\0';
    url_decode(out, raw, max);
    return 1;
}

/* ─── Read entire POST body ─── */
static void read_post_body(char *body, int max) {
    const char *cl = getenv("CONTENT_LENGTH");
    int len = cl ? atoi(cl) : 0;
    if (len <= 0 || len >= max) len = max - 1;
    int n = (int)fread(body, 1, len, stdin);
    body[n] = '\0';
}

/* ─── Fine calculation ─── */
static int calc_fine(const char *due_date_str) {
    struct tm due = {0};
    int y, m, d;
    if (sscanf(due_date_str, "%d-%d-%d", &y, &m, &d) != 3) return 0;
    due.tm_year = y - 1900;
    due.tm_mon  = m - 1;
    due.tm_mday = d;
    due.tm_isdst = -1;
    time_t due_t = mktime(&due);
    time_t now   = time(NULL);
    double diff  = difftime(now, due_t);
    int days_late = (int)(diff / 86400.0);
    return days_late > 0 ? days_late * FINE_PER_DAY : 0;
}

/* ─── Escape JSON strings ─── */
static void json_escape(char *dst, const char *src, int max) {
    int i = 0, j = 0;
    while (src[i] && j < max - 2) {
        if (src[i] == '"' || src[i] == '\\') dst[j++] = '\\';
        dst[j++] = src[i++];
    }
    dst[j] = '\0';
}

#endif /* COMMON_H */
