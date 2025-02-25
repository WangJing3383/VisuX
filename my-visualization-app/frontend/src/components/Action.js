import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

//no usages
class Action {
  constructor(
    name,
    type,
    data,
    userId,
    executeFunction = null,
    undoFunction = null
  ) {
    this.name = name;
    this.type = type; // "user" or "system"
    this.data = data; // { fileName, file }
    this.userId = userId; // Records of who performs
    this.timestamp = new Date();
    this.status = "pending"; // "pending", "success", "failed"
    this.executeFunction = executeFunction; // UI Operation
    this.undoFunction = undoFunction; // UI operation undo
  }

  // Execute the action (local operation)
  execute() {
    if (this.executeFunction) {
        try {
            this.executeFunction(this.data);
            this.status = "success";
        } catch (error) {
            this.status = "failed";
            console.error(`Action Failed: ${this.name}`, error);
        }
    } else {
        console.warn(`No execute function for action: ${this.name}`);
    }
}


  // Undo the action
  undo() {
    if (this.undoFunction) {
      try {
        this.undoFunction(this.data);
        console.log(`Undo action: ${this.name}`);
      } catch (error) {
        console.error(`Undo Failed: ${this.name}`, error);
      }
    } else {
      console.warn(`No undo function for action: ${this.name}`);
    }
  }

  // whether it was triggered by the user
  isUserAction() {
    return this.type === "user";
  }

  // Update status
  updateStatus(newStatus) {
    this.status = newStatus;
  }

  // Convert to JSON
  toJSON() {
    return JSON.stringify({
      name: this.name,
      type: this.type,
      data: this.data,
      userId: this.userId,
      timestamp: this.timestamp,
      status: this.status,
    });
  }

  // Get operation details (for logging)
  getActionDetails() {
    return `Action: ${this.name}, Type: ${this.type}, User: ${this.userId}, Time: ${this.timestamp}, Status: ${this.status}`;
  }

  // Asynchronous execution (interaction with the backend)
  async handleUserAction(actionType, parameters = {}) {
    try {
      const response = await axios.post(`${API_URL}handle_user_action/`, {
        action: actionType,
        parameters: parameters,
      });

      // Set status to success
      this.status = "success";
      console.log(`Action succeeded: ${this.name}`);
      return response.data;
    } catch (error) {
      this.status = "failed";
      console.error(`Action failed: ${this.name}`, error.response || error);
      throw error.response?.data || { error: "An unknown error occurred" };
    }
  }
}

export default Action;
