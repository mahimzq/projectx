import openpyxl
import uuid
from datetime import datetime

def generate_sql(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    sheet = wb["Project X Action Plan"]
    
    sql_statements = [
        "DELETE FROM Task;",
        "DELETE FROM Phase;",
        "DELETE FROM User;"
    ]
    
    users = {}
    phases = {}
    
    def get_val(row, col_idx):
        if col_idx >= len(row): return "NULL"
        val = row[col_idx].value
        if val is None: return "NULL"
        if isinstance(val, (int, float)): return str(val)
        if isinstance(val, datetime): return "'{}'".format(val.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
        return "'{}'".format(str(val).replace("'", "''"))

    current_phase = None
    
    # Correct Phase names from Excel content (based on visual inspection of previous step)
    phase_map = {
        "Phase 1: Discovery & Planning": 1,
        "Phase 2: Mobalisation": 2,
        "Phase 3: Recruitment, Training & Development": 3
    }
    
    count = 0
    for row in sheet.iter_rows(min_row=1):
        # We need to find where the phases are. 
        # In the previous trace, Phase 1 was at row 7, 2 at 18, 3 at 71
        # Let's check column C (index 2)
        cell_val = row[2].value
        if not cell_val: continue
        
        c_val = str(cell_val).strip()
        if c_val in phase_map:
            phase_name = c_val
            if phase_name not in phases:
                phase_id = str(uuid.uuid4())
                phases[phase_name] = phase_id
                sql_statements.append("INSERT INTO Phase (id, name, [order]) VALUES ('{}', '{}', {});".format(phase_id, phase_name, phase_map[phase_name]))
            current_phase = phases[phase_name]
            continue
            
        # If it's a data row (priority in col B is not empty and is one of the priorities)
        priority_val = str(row[1].value).strip() if row[1].value else ""
        if priority_val in ["Low", "Medium", "High"] and current_phase:
            task_id = str(uuid.uuid4())
            priority = get_val(row, 1)
            action_item = get_val(row, 2)
            status = get_val(row, 3)
            start_date = get_val(row, 4)
            due_date = get_val(row, 5)
            duration = get_val(row, 6)
            actual_end = get_val(row, 7)
            actual_days = get_val(row, 8)
            variance = get_val(row, 9)
            action_type = get_val(row, 11)
            evidence = get_val(row, 13)
            owner_name = row[14].value if len(row) > 14 else None
            completed_by = get_val(row, 15)
            resources = get_val(row, 16)
            cost = get_val(row, 17)
            notes = get_val(row, 18)
            
            owner_id = "NULL"
            if owner_name and owner_name != "NULL":
                owner_name = str(owner_name).strip()
                if owner_name not in users:
                    u_id = str(uuid.uuid4())
                    users[owner_name] = u_id
                    email = "{}@example.com".format(owner_name.lower().replace(' ', '.'))
                    sql_statements.append("INSERT INTO User (id, email, password, name, role) VALUES ('{}', '{}', 'password', '{}', 'STAFF');".format(u_id, email, owner_name))
                owner_id = "'{}'".format(users[owner_name])
                
            rag = "'GREEN'"
            if status == "'On Hold'": rag = "'AMBER'"

            sql = """INSERT INTO Task (id, actionItem, priority, status, startDate, dueDate, durationDays, actualEndDate, actualDays, variance, evidence, actionType, ragRating, completedBy, ownerId, phaseId, resources, estimatedCost, notes, createdAt, updatedAt) 
VALUES ('{}', {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, '{}', {}, {}, {}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);""".format(
                task_id, action_item, priority, status, start_date, due_date, duration, actual_end, actual_days, variance, evidence, action_type, rag, completed_by, owner_id, current_phase, resources, cost, notes
            )
            sql_statements.append(sql)
            count += 1

    with open("seed_v3.sql", "w") as f:
        f.write("\n".join(sql_statements))
    print("Generated {} tasks".format(count))

if __name__ == "__main__":
    generate_sql("/Users/mindset/Desktop/Project/Mindset/Project_X_Mobilisation_Plan.xlsx")
