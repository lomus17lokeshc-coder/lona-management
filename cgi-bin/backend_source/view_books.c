/*
 * view_books.c – Lona Library CGI
 * GET → returns all books as a JSON array (same as books.c GET).
 * This is the dedicated read-only endpoint.
 */

#include "common.h"

int main(void) {
    FILE *f = fopen(BOOKS_FILE, "r");
    cgi_json_header();
    printf("[");

    if (!f) {
        printf("]");
        return 0;
    }

    char line[MAX_LINE];
    int first = 1;
    while (fgets(line, MAX_LINE, f)) {
        line[strcspn(line, "\r\n")] = '\0';
        if (strlen(line) < 3) continue;

        int  id = 0, sem = 0, qty = 0, issued = 0;
        char title[MAX_STR], author[MAX_STR], cat[MAX_STR], dept[MAX_STR];

        if (sscanf(line, "%d|%127[^|]|%127[^|]|%127[^|]|%127[^|]|%d|%d|%d",
                   &id, title, author, cat, dept, &sem, &qty, &issued) == 8) {
            char etitle[MAX_STR*2], eauthor[MAX_STR*2], ecat[MAX_STR*2], edept[MAX_STR*2];
            json_escape(etitle,  title,  sizeof(etitle));
            json_escape(eauthor, author, sizeof(eauthor));
            json_escape(ecat,    cat,    sizeof(ecat));
            json_escape(edept,   dept,   sizeof(edept));

            if (!first) printf(",");
            first = 0;
            printf("{\"id\":%d,\"title\":\"%s\",\"author\":\"%s\","
                   "\"category\":\"%s\",\"dept\":\"%s\","
                   "\"sem\":%d,\"qty\":%d,\"issued\":%d}",
                   id, etitle, eauthor, ecat, edept, sem, qty, issued);
        }
    }
    printf("]");
    fclose(f);
    return 0;
}
