/*
 * return_book.c – Lona Library CGI
 * Marks a book as returned and calculates fine.
 * POST fields: issue_id
 *
 * issued.txt format:
 *   issue_id|student_id|book_id|issue_date|due_date|returned(0/1)
 */

#include "common.h"

static void update_books_issued_dec(int book_id) {
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
            if (issued > 0) issued--;
            fprintf(fw, "%d|%s|%s|%s|%s|%d|%d|%d\n", id, title, author, cat, dept, sem, qty, issued);
        } else {
            fputs(lines[i], fw);
        }
    }
    fclose(fw);
}

int main(void) {
    char body[MAX_LINE * 4];
    read_post_body(body, sizeof(body));

    char fissue_id[MAX_STR];
    get_post_field(body, "issue_id", fissue_id, MAX_STR);

    cgi_json_header();

    if (!fissue_id[0]) {
        printf("{\"status\":\"error\",\"message\":\"Missing issue_id\"}");
        return 0;
    }

    FILE *fr = fopen(ISSUED_FILE, "r");
    if (!fr) {
        printf("{\"status\":\"error\",\"message\":\"Cannot open issued file\"}");
        return 0;
    }

    char lines[500][MAX_LINE];
    int  count = 0;
    while (count < 500 && fgets(lines[count], MAX_LINE, fr)) count++;
    fclose(fr);

    int found    = 0;
    int already  = 0;
    int book_id  = 0;
    int fine_amt = 0;
    char due_date[MAX_STR] = "";

    for (int i = 0; i < count; i++) {
        char iid[MAX_STR], sid[MAX_STR], isdate[MAX_STR], ddate[MAX_STR];
        int  bid, ret;
        if (sscanf(lines[i], "%127[^|]|%127[^|]|%d|%127[^|]|%127[^|]|%d",
                   iid, sid, &bid, isdate, ddate, &ret) == 6
            && strcmp(iid, fissue_id) == 0) {
            found = 1;
            if (ret == 1) { already = 1; break; }
            book_id  = bid;
            fine_amt = calc_fine(ddate);
            strncpy(due_date, ddate, MAX_STR);
            /* Mark as returned */
            snprintf(lines[i], MAX_LINE, "%s|%s|%d|%s|%s|1\n",
                     iid, sid, bid, isdate, ddate);
            break;
        }
    }

    if (!found) {
        printf("{\"status\":\"error\",\"message\":\"Issue record not found\"}");
        return 0;
    }
    if (already) {
        printf("{\"status\":\"error\",\"message\":\"Book already returned\"}");
        return 0;
    }

    /* Rewrite the issued file */
    FILE *fw = fopen(ISSUED_FILE, "w");
    if (!fw) {
        printf("{\"status\":\"error\",\"message\":\"Cannot write issued file\"}");
        return 0;
    }
    for (int i = 0; i < count; i++) fputs(lines[i], fw);
    fclose(fw);

    /* Decrement book issued count */
    update_books_issued_dec(book_id);

    printf("{\"status\":\"ok\",\"message\":\"Book returned successfully\","
           "\"fine\":%d,\"book_id\":%d}", fine_amt, book_id);
    return 0;
}
