import openpyxl

def dump_excel(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    sheet = wb["Project X Action Plan"]
    for row_idx, row in enumerate(sheet.iter_rows(max_row=100, values_only=True), 1):
        content = [str(c) if c is not None else "" for c in row]
        if any(content):
            print(f"Row {row_idx}: {' | '.join(content[:6])}")

if __name__ == "__main__":
    dump_excel("/Users/mindset/Desktop/Project/Mindset/Project_X_Mobilisation_Plan.xlsx")
