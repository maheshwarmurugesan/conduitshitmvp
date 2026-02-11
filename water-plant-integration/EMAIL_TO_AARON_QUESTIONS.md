# Email to Aaron — Questions We Need to Build the Integration

You can send this as-is or tweak the tone to match how you usually email him.

---

**Subject:** Quick questions so we can build the integration properly

---

Hey Aaron,

Hope you’re doing well. I’m making progress on the integration platform we talked about and wanted to ask a few concrete questions so we can build it to match how your plant (and others) actually work.

**1. SCADA – how you get the data**  
- How do you (or a system) usually **read** current readings and alarms from SCADA? For example:  
  - Direct connection to the SCADA software (e.g. OPC, MQTT, or a database the SCADA writes to), or  
  - An export/report that gets generated on a schedule?  
- Do you have a **list of the main “points” or tags** you care about? For example: flow, chlorine, pH, turbidity, pump status or vibration, tank levels, and any alarm events. Even a short list or screenshot of tag names would help so we can map them correctly.

**2. WIMS – how compliance data gets in**  
- How is data **submitted into WIMS** today? (e.g. someone typing into screens, uploading a file, or an API?)  
- If there’s an API or an approved way for another system to push data in, can you point us to where we could get the **field list and format** (what fields are required, units, etc.)? We want to auto-fill that after the operator approves the readings.

**3. CMMS – work orders**  
- Which **CMMS** does Palo Alto (or the plant you have in mind) use? (e.g. Cityworks, Maintenance Connection, Fiix, Maximo, something else?)  
- Is there a way to **create a work order from outside the CMMS**? (e.g. an API, or an import file format they support?)  
- How do you match “our” asset names (e.g. “Pump 3”) to the CMMS? Is there a list of assets or IDs we could use so we can pre-fill the right asset when we create a work order from an alert?

**4. Electronic logs**  
- How are **shift / electronic log entries** created today? (e.g. a separate e-log system, or part of WIMS/CMMS?)  
- If there’s an **API or a standard way** to create a log entry (e.g. “readings approved” or “work order created for Pump 3”), we’d like to hook into that so everything is in one place. If not, we can build our own log and keep it as the main record.

**5. Pilot / first version**  
- For a **first test**, would it be easier to start with one plant and one shift?  
- Who would need to be able to do what? (e.g. who can “approve and sync” morning data, and who can create work orders from alerts?) That helps us set up roles correctly.

No rush—when you have a few minutes, even short answers or “we do X” plus a contact (e.g. IT or the vendor) would be enough for us to move forward. And if it’s easier to jump on a short call for some of this, I’m happy to do that too.

Thanks again for your help.

Best,  
Mahesh

---

**Note:** When Aaron replies, you can forward or paste the relevant parts into the project (or to me), and we’ll use his answers to connect the app to the real systems step by step.
