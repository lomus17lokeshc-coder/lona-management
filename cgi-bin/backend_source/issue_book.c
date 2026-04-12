/*
 * issue_book.c – Lona Library CGI
 * Issues a book to a student.
 * POST fields: student_id, book_id, due_date
 *
 * issued.txt format:
 *   issue_id|student_id|book_id|issue_date|due_date|returned(0/1)
 */

#include "common.h"

static void update_books_issued(int book_id, int delta) {
    FILE *fr = fopen(BOOKS_FILE, "r");
    if (!fr) return;

    char lines[200][MAX_LINE];
    int  count = 0;
    while (count < 200 && fgets(lines[count], MAX_LINE, fr)) count++;
    fclose(fr);

    FILE *fw = fopen(BOOKS_FILE, "w");
    if (!fw) return;
    for (int i = 0; i < count; i++) {
        int id, sem, qty, issued;
        char title[MAX_STR], author[MAX_STR], cat[MAX_STR], dept[MAX_STR];
        if (sscanf(lines[i], "%d|%127[^|]|%127[^|]|%127[^|]|%127[^|]|%d|%d|%d",
                   &id, title, author, cat, dept, &sem, &qty, &issued) == 8 && id == book_id) {
            issued += delta;
            if (issued < 0) issued = 0;
            fprintf(fw, "%d|%s|%s|%s|%s|%d|%d|%d\n", id, title, author, cat, dept, sem, qty, issued);
        } else {
            fputs(lines[i], fw);
        }
    }
    fclose(fw);
}

static int find_book(int book_id, int *qty, int *issued) {
    FILE *f = fopen(BOOKS_FILE, "r");
    if (!f) return 0;
    char line[MAX_LINE];
    while (fgets(line, MAX_LINE, f)) {
        int id, sem;
        char t[MAX_STR],a[MAX_STR],c[MAX_STR],d[MAX_STR];
        if (sscanf(line, "%d|%127[^|]|%127[^|]|%127[^|]|%127[^|]|%d|%d|%d",
                   &id, t, a, c, d, &sem, qty, issued) == 8 && id == book_id) {
            fclose(f);
            return 1;
        }
    }
    fclose(f);
    return 0;
}

static int find_student(const char *sid) {
    FILE *f = fopen(USERS_FILE, "r");
    if (!f) return 0;
    char line[MAX_LINE];
    while (fgets(line, MAX_LINE, f)) {
        char id[MAX_STR];
        if (sscanf(line, "%127[^|]|", id) == 1 && strcmp(id, sid) == 0) {
            fclose(f); return 1;
        }
    }
    fclose(f);
    return 0;
}

static int already_issued(const char *sid, int bid) {
    FILE *f = fopen(ISSUED_FILE, "r");
    if (!f) return 0;
    char line[MAX_LINE];
    while (fgets(line, MAX_LINE, f)) {
        char iid[MAX_STR], st[MAX_STR], id_[MAX_STR], id2[MAX_STR], dd[MAX_STR];
        int  bk, ret;
        if (sscanf(line, "%127[^|]|%127[^|]|%d|%127[^|]|%127[^|]|%d",
                   iid, st, &bk, id_,  dd, &ret) == 6) {
            if (strcmp(st, sid) == 0 && bk == bid && ret == 0) {
                fclose(f); return 1;
            }
        }
    }
    fclose(f);
    return 0;
}

int main(void) {
    char body[MAX_LINE * 4];
    read_post_body(body, sizeof(body));

    char fsid[MAX_STR], fbid[MAX_STR], fdue[MAX_STR];
    get_post_field(body, "student_id", fsid, MAX_STR);
    get_post_field(body, "book_id",    fbid, MAX_STR);
    get_post_field(body, "due_date",   fdue, MAX_STR);

    int book_id = atoi(fbid);
    cgi_json_header();

    if (!fsid[0] || book_id <= 0 || !fdue[0]) {
        printf("{\"status\":\"error\",\"message\":\"Missing fields\"}"); return 0;
    }
    if (!find_student(fsid)) {
        printf("{\"status\":\"error\",\"message\":\"Student ID not found\"}"); return 0;
    }
    int qty = 0, issued = 0;
    if (!find_book(book_id, &qty, &issued)) {
        printf("{\"status\":\"error\",\"message\":\"Book ID not found\"}"); return 0;
    }
    if (qty - issued <= 0) {
        printf("{\"status\":\"error\",\"message\":\"No copies available\"}"); return 0;
    }
    if (already_issued(fsid, book_id)) {
        printf("{\"status\":\"error\",\"message\":\"Student already has this book\"}"); return 0;
    }

    /* Get today's date */
    time_t now = time(NULL);
    struct tm *lt = localtime(&now);
    char today[MAX_STR];
    strftime(today, MAX_STR, "%Y-%m-%d", lt);

    /* Unique issue ID from timestamp */
    char issue_id[MAX_STR];
    snprintf(issue_id, MAX_STR, "ISS%ld", (long)now);

    FILE *fa = fopen(ISSUED_FILE, "a");
    if (!fa) {
        printf("{\"status\":\"error\",\"message\":\"Cannot write to issued file\"}"); return 0;
    }
    fprintf(fa, "%s|%s|%d|%s|%s|0\n", issue_id, fsid, book_id, today, fdue);
    fclose(fa);

    update_books_issued(book_id, 1);

    printf("{\"status\":\"ok\",\"message\":\"Book issued successfully\","
           "\"issue_id\":\"%s\",\"due_date\":\"%s\"}", issue_id, fdue);
    return 0;
}
