import openpyxl
import uuid
from datetime import datetime

def generate_sql(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    sheet = wb["Project X Action Plan"]
    
    sql_statements = [
        'DELETE FROM "Task";',
        'DELETE FROM "Phase";',
        'DELETE FROM "User";'
    ]
    
    users = {}
    phases = {}
    
    # Create a default owner 
    default_owner_id = str(uuid.uuid4())
    sql_statements.append("""INSERT INTO "User" (id, email, password, name, role) VALUES ('{}', 'admin@example.com', 'password', 'System Admin', 'ADMIN');""".format(default_owner_id))
    
    def get_val(row, col_idx):
        if col_idx >= len(row): return "NULL"
        val = row[col_idx]
        if val is None: return "NULL"
        if isinstance(val, (int, float)): return str(val)
        if isinstance(val, datetime): return "'{}'".format(val.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
        return "'{}'".format(str(val).replace("'", "''"))

    def get_date(row, col_idx):
        if col_idx >= len(row): return "NULL"
        val = row[col_idx]
        if val is None or str(val).strip() == "": return "NULL"
        if isinstance(val, datetime): return "'{}'".format(val.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
        # If it's a string, attempt to parse or just return NULL
        try:
            # simple check if it looks like a date/time
            parsed = datetime.strptime(str(val).strip(), '%Y-%m-%d %H:%M:%S')
            return "'{}'".format(parsed.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
        except:
             # handle common formats or fallback to NULL
             try:
                parsed = datetime.strptime(str(val).strip(), '%Y-%m-%d')
                return "'{}'".format(parsed.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
             except:
                return "NULL"

    def get_num(row, col_idx, default="0"):
        if col_idx >= len(row): return default
        val = row[col_idx]
        if val is None or val == "NULL": return default
        try:
            return str(float(val))
        except:
            return default

    def add_phase(name, order):
        if name not in phases:
            p_id = str(uuid.uuid4())
            phases[name] = p_id
            sql = """INSERT INTO "Phase" (id, name, "order") VALUES ('{}', '{}', {});""".format(p_id, name, order)
            sql_statements.append(sql)
        return phases[name]

    ranges = [
        ("Phase 1: Discovery & Planning", 1, 12, 23),
        ("Phase 2: Mobalisation", 2, 26, 78),
        ("Phase 3: Recruitment, Training & Development", 3, 84, 95)
    ]
    
    count = 0
    for phase_name, order, start_row, end_row in ranges:
        current_phase_id = add_phase(phase_name, order)
        
        for r_idx in range(start_row, end_row + 1):
            row = [cell.value for cell in sheet[r_idx]]
            if len(row) < 3 or not row[2]: continue
            
            task_id = str(uuid.uuid4())
            priority = get_val(row, 1)
            action_item = get_val(row, 2)
            status = get_val(row, 3)
            start_date = get_date(row, 4)
            due_date = get_date(row, 5)
            duration = get_num(row, 6)
            actual_end = get_date(row, 7)
            actual_days = get_num(row, 8)
            variance = get_val(row, 9)
            action_type = get_val(row, 11)
            evidence = get_val(row, 13)
            owner_name = row[14] if len(row) > 14 else None
            completed_by = get_val(row, 15)
            resources = get_val(row, 16)
            cost = get_num(row, 17)
            notes = get_val(row, 18)
            
            owner_id = default_owner_id
            if owner_name and str(owner_name).strip() != "None" and str(owner_name).strip() != "":
                owner_name = str(owner_name).strip()
                if owner_name not in users:
                    u_id = str(uuid.uuid4())
                    users[owner_name] = u_id
                    email = "{}@example.com".format(owner_name.lower().replace(' ', '.'))
                    sql_statements.append("""INSERT INTO "User" (id, email, password, name, role) VALUES ('{}', '{}', 'password', '{}', 'STAFF');""".format(u_id, email, owner_name))
                owner_id = users[owner_name]
                
            rag = "'GREEN'"
            if status == "'On Hold'": rag = "'AMBER'"

            sql = """INSERT INTO "Task" ("id", "actionItem", "priority", "status", "startDate", "dueDate", "durationDays", "actualEndDate", "actualDays", "variance", "evidence", "actionType", "ragRating", "completedBy", "ownerId", "phaseId", "resources", "estimatedCost", "notes", "createdAt", "updatedAt") 
VALUES ('{}', {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, '{}', '{}', {}, {}, {}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);""".format(
                task_id, action_item, priority, status, start_date, due_date, duration, actual_end, actual_days, variance, evidence, action_type, rag, completed_by, owner_id, current_phase_id, resources, cost, notes
            )
            sql_statements.append(sql)
            count += 1

    with open("seed_v_final.sql", "w") as f:
        f.write("\n".join(sql_statements))
    print("Generated {} tasks".format(count))

if __name__ == "__main__":
    generate_sql("/Users/mindset/Desktop/Project/Mindset/Project_X_Mobilisation_Plan.xlsx")
