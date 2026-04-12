#include "common.h"

int main() {
    print_text_headers();
    
    // Read POST body from stdin (e.g. from fetch POST without encoding overhead)
    char buffer[1024] = {0};
    if (fgets(buffer, sizeof(buffer), stdin) == NULL) {
        printf("ERROR|No data received.\n");
        return 0;
    }

    // Expected format: id|name|author|quantity
    Book newBook;
    newBook.issued = 0; // default for new book
    if (sscanf(buffer, "%d|%99[^|]|%99[^|]|%d", &newBook.id, newBook.name, newBook.author, &newBook.quantity) != 4) {
        printf("ERROR|Invalid data format.\n");
        return 0;
    }

    // Check if ID already exists
    FILE *fp = fopen(DATA_FILE, "rb");
    if (fp) {
        Book temp;
        while (fread(&temp, sizeof(Book), 1, fp) == 1) {
            if (temp.id == newBook.id) {
                printf("ERROR|Book ID already exists.\n");
                fclose(fp);
                return 0;
            }
        }
        fclose(fp);
    }

    // Append new book
    fp = fopen(DATA_FILE, "ab"); // append in binary mode
    if (!fp) {
        printf("ERROR|Failed to open database file.\n");
        return 0;
    }

    fwrite(&newBook, sizeof(Book), 1, fp);
    fclose(fp);

    printf("SUCCESS|Book added successfully!\n");
    return 0;
}
