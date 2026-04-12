/*
 * books.c – Lona Library CGI
 * Handles:
 *   GET  → returns all books as JSON array
 *   POST → adds a new book
 *
 * books.txt format (pipe-separated):
 *   id|title|author|category|dept|sem|qty|issued
 */

#include "common.h"

static void list_books(void) {
    FILE *f = fopen(BOOKS_FILE, "r");
    cgi_json_header();
    printf("[");

    if (!f) {
        printf("]");
        return;
    }

    char line[MAX_LINE];
    int first = 1;
    while (fgets(line, MAX_LINE, f)) {
        /* Strip newline */
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
}

static void add_book(void) {
    char body[MAX_LINE * 4];
    read_post_body(body, sizeof(body));

    char fid[MAX_STR], title[MAX_STR], author[MAX_STR];
    char cat[MAX_STR], dept[MAX_STR], fsem[MAX_STR], fqty[MAX_STR];

    get_post_field(body, "id",       fid,    MAX_STR);
    get_post_field(body, "title",    title,  MAX_STR);
    get_post_field(body, "author",   author, MAX_STR);
    get_post_field(body, "category", cat,    MAX_STR);
    get_post_field(body, "dept",     dept,   MAX_STR);
    get_post_field(body, "sem",      fsem,   MAX_STR);
    get_post_field(body, "qty",      fqty,   MAX_STR);

    int id  = atoi(fid);
    int sem = atoi(fsem);
    int qty = atoi(fqty);

    if (id <= 0 || !title[0] || !author[0] || qty <= 0) {
        cgi_json_header();
        printf("{\"status\":\"error\",\"message\":\"Missing or invalid fields\"}");
        return;
    }

    /* Check duplicate ID */
    FILE *fr = fopen(BOOKS_FILE, "r");
    if (fr) {
        char line[MAX_LINE];
        while (fgets(line, MAX_LINE, fr)) {
            int eid;
            if (sscanf(line, "%d|", &eid) == 1 && eid == id) {
                fclose(fr);
                cgi_json_header();
                printf("{\"status\":\"error\",\"message\":\"Book ID %d already exists\"}", id);
                return;
            }
        }
        fclose(fr);
    }

    /* Append */
    FILE *fa = fopen(BOOKS_FILE, "a");
    if (!fa) {
        cgi_json_header();
        printf("{\"status\":\"error\",\"message\":\"Cannot write to books file\"}");
        return;
    }
    fprintf(fa, "%d|%s|%s|%s|%s|%d|%d|0\n",
            id, title, author,
            cat[0] ? cat : "General",
            dept[0] ? dept : "All",
            sem, qty);
    fclose(fa);

    cgi_json_header();
    printf("{\"status\":\"ok\",\"message\":\"Book added successfully\",\"id\":%d}", id);
}

int main(void) {
    const char *method = getenv("REQUEST_METHOD");
    if (method && strcmp(method, "POST") == 0) {
        add_book();
    } else {
        list_books();
    }
    return 0;
}
