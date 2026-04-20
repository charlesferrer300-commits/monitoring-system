import random
import tkinter as tk
from datetime import datetime
from tkinter import ttk

import theme


class MonitoringApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Smart Door Lock and Room Temperature Monitoring System")
        self.root.geometry("1360x860")
        self.root.minsize(1160, 760)
        self.root.configure(bg=theme.APP_BG)
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.clock_job = None
        self.sensor_job = None

        self.is_locked = True
        self.temperature = 24.8
        self.humidity = 47
        self.entries_today = 14
        self.last_update = datetime.now()
        self.last_action_text = "Controller boot completed"
        self.packet_rate = 118
        self.latency_ms = 12
        self.signal_strength = 98
        self.network_health = 96
        self.temperature_history = [24.2, 24.5, 24.8, 25.0, 25.2, 24.9, 24.7, 24.8, 25.1, 25.0, 24.9, 24.8]
        self.latency_history = [10, 12, 11, 13, 12, 14, 11, 12, 13, 12, 11, 12]
        self.logs = [
            "08:42 AM  Edge lock node acknowledged secure state",
            "08:31 AM  Temperature sensor heartbeat received",
            "08:15 AM  Authorized unlock packet accepted",
            "07:30 AM  Monitoring controller initialized",
        ]

        self._configure_styles()
        self._build_ui()
        self._bind_events()
        self.refresh_visuals()
        self.render_logs()
        self.update_clock()
        self.sensor_job = self.root.after(3000, self.schedule_sensor_loop)

    def _configure_styles(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("App.TFrame", background=theme.APP_BG)
        style.configure(
            "Primary.TButton",
            background=theme.ACCENT,
            foreground=theme.BUTTON_TEXT_DARK,
            font=(theme.FONT_FAMILY, 11, "bold"),
            padding=10,
            borderwidth=0,
        )
        style.map("Primary.TButton", background=[("active", "#74d3fb")])
        style.configure(
            "Danger.TButton",
            background=theme.DANGER,
            foreground=theme.TEXT,
            font=(theme.FONT_FAMILY, 11, "bold"),
            padding=10,
            borderwidth=0,
        )
        style.map("Danger.TButton", background=[("active", "#fb7185")])
        style.configure(
            "Soft.TButton",
            background=theme.PANEL_ALT,
            foreground=theme.TEXT,
            font=(theme.FONT_FAMILY, 11, "bold"),
            padding=10,
            borderwidth=0,
        )
        style.map("Soft.TButton", background=[("active", "#2a4468")])

    def _build_ui(self) -> None:
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

        shell = ttk.Frame(self.root, style="App.TFrame", padding=18)
        shell.grid(row=0, column=0, sticky="nsew")
        shell.grid_columnconfigure(0, weight=1)
        shell.grid_rowconfigure(1, weight=1)

        self.header = tk.Frame(shell, bg=theme.SURFACE, padx=22, pady=18, highlightthickness=1, highlightbackground=theme.BORDER)
        self.header.grid(row=0, column=0, sticky="ew", pady=(0, 14))
        self.header.grid_columnconfigure(0, weight=3)
        self.header.grid_columnconfigure(1, weight=2)

        left_head = tk.Frame(self.header, bg=theme.SURFACE)
        left_head.grid(row=0, column=0, sticky="w")
        tk.Label(
            left_head,
            text="Smart Door Lock and Room Temperature Monitoring System",
            bg=theme.SURFACE,
            fg=theme.TEXT,
            font=theme.TITLE_FONT,
        ).pack(anchor="w")
        tk.Label(
            left_head,
            text="Built around a networking workflow: edge nodes, controller status, latency, packet rate, and device health for the smart door lock and room sensor.",
            bg=theme.SURFACE,
            fg=theme.TEXT_MUTED,
            justify="left",
            wraplength=720,
            font=theme.BODY_FONT,
        ).pack(anchor="w", pady=(8, 0))

        right_head = tk.Frame(self.header, bg=theme.SURFACE)
        right_head.grid(row=0, column=1, sticky="e")
        self.status_badge = self.make_badge(right_head, "Network Healthy", theme.SUCCESS_SOFT, theme.SUCCESS)
        self.status_badge.pack(anchor="e")
        self.clock_label = tk.Label(right_head, text="--:--:--", bg=theme.SURFACE, fg=theme.TEXT, font=(theme.FONT_FAMILY, 20, "bold"))
        self.clock_label.pack(anchor="e", pady=(10, 0))
        self.date_label = tk.Label(right_head, text="--", bg=theme.SURFACE, fg=theme.TEXT_MUTED, font=theme.BODY_FONT)
        self.date_label.pack(anchor="e", pady=(6, 0))

        body = tk.Frame(shell, bg=theme.APP_BG)
        body.grid(row=1, column=0, sticky="nsew")
        body.grid_columnconfigure(0, weight=4)
        body.grid_columnconfigure(1, weight=3)
        body.grid_rowconfigure(0, weight=1)
        body.grid_rowconfigure(1, weight=1)

        left = tk.Frame(body, bg=theme.APP_BG)
        left.grid(row=0, column=0, rowspan=2, sticky="nsew", padx=(0, 8))
        left.grid_columnconfigure(0, weight=1)
        left.grid_rowconfigure(1, weight=1)
        left.grid_rowconfigure(2, weight=1)

        self.metrics_panel = tk.Frame(left, bg=theme.APP_BG)
        self.metrics_panel.grid(row=0, column=0, sticky="ew", pady=(0, 12))
        for col in range(4):
            self.metrics_panel.grid_columnconfigure(col, weight=1)

        metric_specs = (
            ("Door Node", theme.SUCCESS_SOFT, theme.SUCCESS),
            ("Sensor Node", theme.ACCENT_SOFT, theme.ACCENT),
            ("Latency", theme.WARNING_SOFT, theme.WARNING),
            ("Packet Rate", theme.ACCENT_SOFT, theme.ACCENT),
        )
        self.metric_cards = {}
        for idx, (title, chip_bg, chip_fg) in enumerate(metric_specs):
            card = tk.Frame(self.metrics_panel, bg=theme.SURFACE, padx=16, pady=16, highlightthickness=1, highlightbackground=theme.BORDER)
            card.grid(row=0, column=idx, sticky="ew", padx=(0 if idx == 0 else 6, 0 if idx == 3 else 6))
            tk.Label(card, text=title, bg=theme.SURFACE, fg=theme.TEXT_DIM, font=theme.LABEL_FONT).pack(anchor="w")
            value = tk.Label(card, text="--", bg=theme.SURFACE, fg=theme.TEXT, font=theme.VALUE_FONT)
            value.pack(anchor="w", pady=(10, 0))
            hint = tk.Label(card, text="--", bg=chip_bg, fg=chip_fg, font=theme.SMALL_FONT, padx=10, pady=5)
            hint.pack(anchor="w", pady=(12, 0))
            self.metric_cards[title] = {"value": value, "hint": hint}

        self.topology_panel = tk.Frame(left, bg=theme.SURFACE, padx=18, pady=18, highlightthickness=1, highlightbackground=theme.BORDER)
        self.topology_panel.grid(row=1, column=0, sticky="nsew", pady=(0, 12))
        self.topology_panel.grid_columnconfigure(0, weight=1)
        self.topology_panel.grid_rowconfigure(1, weight=1)
        tk.Label(self.topology_panel, text="IoT Network Topology", bg=theme.SURFACE, fg=theme.TEXT, font=theme.SECTION_FONT).grid(row=0, column=0, sticky="w")
        self.topology_canvas = tk.Canvas(self.topology_panel, bg=theme.SURFACE_ALT, highlightthickness=1, highlightbackground=theme.BORDER)
        self.topology_canvas.grid(row=1, column=0, sticky="nsew", pady=(14, 0))

        self.telemetry_panel = tk.Frame(left, bg=theme.SURFACE, padx=18, pady=18, highlightthickness=1, highlightbackground=theme.BORDER)
        self.telemetry_panel.grid(row=2, column=0, sticky="nsew")
        self.telemetry_panel.grid_columnconfigure(0, weight=1)
        self.telemetry_panel.grid_rowconfigure(2, weight=1)
        tk.Label(self.telemetry_panel, text="Environmental and Traffic Telemetry", bg=theme.SURFACE, fg=theme.TEXT, font=theme.SECTION_FONT).grid(row=0, column=0, sticky="w")

        info_row = tk.Frame(self.telemetry_panel, bg=theme.SURFACE)
        info_row.grid(row=1, column=0, sticky="ew", pady=(14, 12))
        info_row.grid_columnconfigure(0, weight=1)
        info_row.grid_columnconfigure(1, weight=1)
        self.info_labels = {}
        for idx, name in enumerate(("Room Temp", "Humidity", "Trend", "Cooling Advice", "Network Health", "Last Update")):
            box = tk.Frame(info_row, bg=theme.PANEL, padx=12, pady=10, highlightthickness=1, highlightbackground=theme.BORDER)
            box.grid(row=idx // 2, column=idx % 2, sticky="ew", padx=(0 if idx % 2 == 0 else 6, 6 if idx % 2 == 0 else 0), pady=(0, 8))
            tk.Label(box, text=name, bg=theme.PANEL, fg=theme.TEXT_DIM, font=theme.SMALL_FONT).pack(anchor="w")
            value = tk.Label(box, text="--", bg=theme.PANEL, fg=theme.TEXT, font=(theme.FONT_FAMILY, 12, "bold"))
            value.pack(anchor="w", pady=(6, 0))
            self.info_labels[name] = value

        self.chart_canvas = tk.Canvas(self.telemetry_panel, bg=theme.SURFACE_ALT, highlightthickness=1, highlightbackground=theme.BORDER)
        self.chart_canvas.grid(row=2, column=0, sticky="nsew")

        right = tk.Frame(body, bg=theme.APP_BG)
        right.grid(row=0, column=1, rowspan=2, sticky="nsew", padx=(8, 0))
        right.grid_columnconfigure(0, weight=1)
        right.grid_rowconfigure(1, weight=1)
        right.grid_rowconfigure(2, weight=1)

        self.control_panel = tk.Frame(right, bg=theme.SURFACE, padx=18, pady=18, highlightthickness=1, highlightbackground=theme.BORDER)
        self.control_panel.grid(row=0, column=0, sticky="nsew", pady=(0, 12))
        self.control_panel.grid_columnconfigure(0, weight=1)
        self.control_panel.grid_columnconfigure(1, weight=1)
        tk.Label(self.control_panel, text="Access Control Node", bg=theme.SURFACE, fg=theme.TEXT, font=theme.SECTION_FONT).grid(row=0, column=0, sticky="w")
        self.door_badge = self.make_badge(self.control_panel, "Locked", theme.SUCCESS_SOFT, theme.SUCCESS)
        self.door_badge.grid(row=0, column=1, sticky="e")

        self.door_canvas = tk.Canvas(self.control_panel, bg=theme.SURFACE_ALT, height=210, highlightthickness=1, highlightbackground=theme.BORDER)
        self.door_canvas.grid(row=1, column=0, columnspan=2, sticky="nsew", pady=(14, 12))

        self.node_status = tk.Label(
            self.control_panel,
            text="Edge lock node is waiting for authenticated commands.",
            bg=theme.SURFACE,
            fg=theme.TEXT_MUTED,
            justify="left",
            wraplength=380,
            font=theme.BODY_FONT,
        )
        self.node_status.grid(row=2, column=0, columnspan=2, sticky="w", pady=(0, 12))

        actions = tk.Frame(self.control_panel, bg=theme.SURFACE)
        actions.grid(row=3, column=0, columnspan=2, sticky="ew")
        for col in range(3):
            actions.grid_columnconfigure(col, weight=1)
        ttk.Button(actions, text="Unlock Node", style="Primary.TButton", command=self.unlock_door).grid(row=0, column=0, sticky="ew", padx=(0, 6))
        ttk.Button(actions, text="Lock Node", style="Danger.TButton", command=self.lock_door).grid(row=0, column=1, sticky="ew", padx=6)
        ttk.Button(actions, text="Poll Devices", style="Soft.TButton", command=self.refresh_sensors).grid(row=0, column=2, sticky="ew", padx=(6, 0))

        self.incident_panel = tk.Frame(right, bg=theme.SURFACE, padx=18, pady=18, highlightthickness=1, highlightbackground=theme.BORDER)
        self.incident_panel.grid(row=1, column=0, sticky="nsew", pady=(0, 12))
        self.incident_panel.grid_columnconfigure(0, weight=1)
        self.incident_panel.grid_rowconfigure(1, weight=1)
        tk.Label(self.incident_panel, text="Event Log", bg=theme.SURFACE, fg=theme.TEXT, font=theme.SECTION_FONT).grid(row=0, column=0, sticky="w")

        log_shell = tk.Frame(self.incident_panel, bg=theme.LIST_BG, highlightthickness=1, highlightbackground=theme.BORDER)
        log_shell.grid(row=1, column=0, sticky="nsew", pady=(14, 0))
        log_shell.grid_columnconfigure(0, weight=1)
        log_shell.grid_rowconfigure(0, weight=1)
        self.logs_list = tk.Listbox(
            log_shell,
            bg=theme.LIST_BG,
            fg=theme.TEXT,
            bd=0,
            highlightthickness=0,
            activestyle="none",
            font=theme.MONO_FONT,
            exportselection=False,
            selectbackground=theme.ACCENT_SOFT,
            selectforeground=theme.TEXT,
        )
        self.logs_list.grid(row=0, column=0, sticky="nsew")
        scroll = tk.Scrollbar(log_shell, orient="vertical", command=self.logs_list.yview)
        scroll.grid(row=0, column=1, sticky="ns")
        self.logs_list.config(yscrollcommand=scroll.set)

        self.summary_panel = tk.Frame(right, bg=theme.SURFACE, padx=18, pady=18, highlightthickness=1, highlightbackground=theme.BORDER)
        self.summary_panel.grid(row=2, column=0, sticky="nsew")
        tk.Label(self.summary_panel, text="Operations Summary", bg=theme.SURFACE, fg=theme.TEXT, font=theme.SECTION_FONT).pack(anchor="w")
        self.detail_labels = {}
        for field in ("Lock Mode", "Sensor State", "Room State", "Temperature Trend", "Last Action", "Latency"):
            row = tk.Frame(self.summary_panel, bg=theme.SURFACE)
            row.pack(fill="x", pady=8)
            tk.Label(row, text=field, bg=theme.SURFACE, fg=theme.TEXT_DIM, font=theme.LABEL_FONT).pack(side="left")
            value = tk.Label(row, text="--", bg=theme.SURFACE, fg=theme.TEXT, font=(theme.FONT_FAMILY, 11, "bold"))
            value.pack(side="right")
            self.detail_labels[field] = value

    def make_badge(self, parent: tk.Widget, text: str, bg: str, fg: str) -> tk.Label:
        return tk.Label(parent, text=text, bg=bg, fg=fg, font=(theme.FONT_FAMILY, 10, "bold"), padx=10, pady=6)

    def _bind_events(self) -> None:
        self.topology_canvas.bind("<Configure>", lambda _event: self.draw_topology())
        self.chart_canvas.bind("<Configure>", lambda _event: self.draw_telemetry())
        self.door_canvas.bind("<Configure>", lambda _event: self.draw_door_status())

    def clamp(self, value: float, low: float, high: float) -> float:
        return max(low, min(high, value))

    def current_room_condition(self) -> str:
        if self.temperature > 27:
            return "Warm"
        if self.temperature < 23:
            return "Cool"
        return "Normal"

    def current_temperature_state(self, previous_temp: float | None) -> str:
        if previous_temp is None:
            return "Stable"
        if self.temperature > previous_temp:
            return "Rising slightly"
        if self.temperature < previous_temp:
            return "Cooling slightly"
        return "Stable"

    def current_cooling_advice(self) -> str:
        if self.temperature > 27:
            return "Increase ventilation on sensor subnet"
        if self.temperature < 23:
            return "No cooling action needed"
        return "Environment is within target range"

    def log_event(self, text: str) -> None:
        stamp = datetime.now().strftime("%I:%M:%S %p")
        self.logs.insert(0, f"{stamp}  {text}")
        self.logs = self.logs[:14]
        self.last_action_text = text
        self.render_logs()

    def render_logs(self) -> None:
        self.logs_list.delete(0, tk.END)
        for item in self.logs:
            self.logs_list.insert(tk.END, item)

    def draw_topology(self) -> None:
        canvas = self.topology_canvas
        canvas.delete("all")
        width = max(canvas.winfo_width(), 540)
        height = max(canvas.winfo_height(), 260)

        nodes = {
            "Controller": (width * 0.5, 60),
            "Door Node": (width * 0.22, height * 0.68),
            "Sensor Node": (width * 0.5, height * 0.68),
            "Client Panel": (width * 0.78, height * 0.68),
        }

        def link(a: str, b: str, color: str) -> None:
            x1, y1 = nodes[a]
            x2, y2 = nodes[b]
            canvas.create_line(x1, y1, x2, y2, fill=color, width=3)

        healthy_color = theme.SUCCESS if self.network_health >= 90 else theme.WARNING
        link("Controller", "Door Node", healthy_color)
        link("Controller", "Sensor Node", theme.ACCENT)
        link("Controller", "Client Panel", theme.ACCENT)

        for name, (x, y) in nodes.items():
            color = theme.ACCENT
            label = name
            if name == "Door Node":
                color = theme.SUCCESS if self.is_locked else theme.WARNING
                label = f"{name}\n{'Locked' if self.is_locked else 'Unlocked'}"
            elif name == "Sensor Node":
                color = theme.SUCCESS if self.signal_strength > 92 else theme.WARNING
                label = f"{name}\n{self.signal_strength}% signal"
            elif name == "Controller":
                label = f"{name}\n{self.network_health}% health"

            canvas.create_oval(x - 42, y - 30, x + 42, y + 30, fill=theme.PANEL, outline=theme.BORDER, width=2)
            canvas.create_text(x, y, text=label, fill=theme.TEXT, font=theme.BODY_FONT)

    def draw_telemetry(self) -> None:
        canvas = self.chart_canvas
        canvas.delete("all")
        width = max(canvas.winfo_width(), 540)
        height = max(canvas.winfo_height(), 220)
        left_pad = 32
        right_pad = 24
        top_pad = 28
        bottom_pad = 28
        usable_w = width - left_pad - right_pad
        usable_h = height - top_pad - bottom_pad

        canvas.create_text(left_pad, 12, anchor="w", text="Temperature and latency traces", fill=theme.TEXT_DIM, font=theme.SMALL_FONT)
        for idx in range(5):
            y = top_pad + idx * (usable_h / 4)
            canvas.create_line(left_pad, y, width - right_pad, y, fill=theme.GRID)

        def plot(values: list[float], minimum: float, maximum: float, color: str) -> None:
            if len(values) < 2:
                return
            points = []
            for idx, value in enumerate(values):
                x = left_pad + usable_w * idx / (len(values) - 1)
                y = top_pad + (1 - self.clamp((value - minimum) / (maximum - minimum), 0, 1)) * usable_h
                points.extend([x, y])
            canvas.create_line(points, fill=color, width=3, smooth=True)

        plot(self.temperature_history, 22, 29.5, theme.ACCENT)
        plot(self.latency_history, 0, 30, theme.WARNING)

        canvas.create_text(width - 120, 20, text="Blue: Temp", fill=theme.ACCENT, font=theme.SMALL_FONT)
        canvas.create_text(width - 52, 20, text="Orange: Latency", fill=theme.WARNING, font=theme.SMALL_FONT)

    def draw_door_status(self) -> None:
        canvas = self.door_canvas
        canvas.delete("all")
        width = max(canvas.winfo_width(), 360)
        height = max(canvas.winfo_height(), 210)
        canvas.create_rectangle(24, 24, width - 24, height - 24, fill=theme.SURFACE_ALT, outline="")

        left = 82
        top = 28
        right = width - 92
        bottom = height - 26

        if self.is_locked:
            points = [left, top, right, top, right, bottom, left, bottom]
            handle_x = right - 24
            label = "Secure state acknowledged"
            color = theme.SUCCESS
        else:
            points = [left, top, right - 44, top + 22, right - 44, bottom + 6, left, bottom]
            handle_x = right - 60
            label = "Access node is open"
            color = theme.WARNING

        canvas.create_polygon(points, fill=theme.PANEL_ALT, outline="")
        canvas.create_rectangle(handle_x, height / 2 - 20, handle_x + 10, height / 2 + 20, fill="#d7dee8", outline="")
        canvas.create_text(width / 2, height - 12, text=label, fill=color, font=(theme.FONT_FAMILY, 11, "bold"))

    def refresh_visuals(self, previous_temp: float | None = None) -> None:
        trend = self.current_temperature_state(previous_temp)
        room_state = self.current_room_condition()
        cooling_advice = self.current_cooling_advice()

        self.status_badge.config(
            text="Network Healthy" if self.network_health >= 90 else "Network Warning",
            bg=theme.SUCCESS_SOFT if self.network_health >= 90 else theme.WARNING_SOFT,
            fg=theme.SUCCESS if self.network_health >= 90 else theme.WARNING,
        )

        self.metric_cards["Door Node"]["value"].config(text="Locked" if self.is_locked else "Unlocked")
        self.metric_cards["Door Node"]["hint"].config(
            text="Edge device responding" if self.is_locked else "Access session active",
            bg=theme.SUCCESS_SOFT if self.is_locked else theme.WARNING_SOFT,
            fg=theme.SUCCESS if self.is_locked else theme.WARNING,
        )

        self.metric_cards["Sensor Node"]["value"].config(text=f"{self.signal_strength}% signal")
        self.metric_cards["Sensor Node"]["hint"].config(text="Heartbeat online", bg=theme.ACCENT_SOFT, fg=theme.ACCENT)

        self.metric_cards["Latency"]["value"].config(text=f"{self.latency_ms} ms")
        self.metric_cards["Latency"]["hint"].config(
            text="Controller path stable" if self.latency_ms <= 18 else "Delay is increasing",
            bg=theme.WARNING_SOFT if self.latency_ms > 18 else theme.ACCENT_SOFT,
            fg=theme.WARNING if self.latency_ms > 18 else theme.ACCENT,
        )

        self.metric_cards["Packet Rate"]["value"].config(text=f"{self.packet_rate} pkt/s")
        self.metric_cards["Packet Rate"]["hint"].config(text="Normal traffic volume", bg=theme.ACCENT_SOFT, fg=theme.ACCENT)

        self.info_labels["Room Temp"].config(text=f"{self.temperature:.1f} C")
        self.info_labels["Humidity"].config(text=f"{self.humidity}%")
        self.info_labels["Trend"].config(text=trend)
        self.info_labels["Cooling Advice"].config(text=cooling_advice)
        self.info_labels["Network Health"].config(text=f"{self.network_health}%")
        self.info_labels["Last Update"].config(text=self.last_update.strftime("%I:%M:%S %p"))

        self.door_badge.config(
            text="Locked" if self.is_locked else "Unlocked",
            bg=theme.SUCCESS_SOFT if self.is_locked else theme.WARNING_SOFT,
            fg=theme.SUCCESS if self.is_locked else theme.WARNING,
        )
        self.node_status.config(
            text="Edge lock node is waiting for authenticated commands."
            if self.is_locked
            else "Edge lock node is currently allowing access traffic."
        )

        self.detail_labels["Lock Mode"].config(text="Secure" if self.is_locked else "Temporarily open")
        self.detail_labels["Sensor State"].config(text="Online")
        self.detail_labels["Room State"].config(text=room_state)
        self.detail_labels["Temperature Trend"].config(text=trend)
        self.detail_labels["Last Action"].config(text=self.last_action_text)
        self.detail_labels["Latency"].config(text=f"{self.latency_ms} ms")

        self.draw_topology()
        self.draw_telemetry()
        self.draw_door_status()

    def update_clock(self) -> None:
        now = datetime.now()
        self.clock_label.config(text=now.strftime("%I:%M:%S %p"))
        self.date_label.config(text=now.strftime("%A, %B %d, %Y"))
        self.clock_job = self.root.after(1000, self.update_clock)

    def update_sensor_data(self) -> None:
        previous_temp = self.temperature
        self.temperature = self.clamp(round(random.uniform(self.temperature - 0.4, self.temperature + 0.5), 1), 22.0, 29.5)
        self.humidity = int(self.clamp(round(random.uniform(self.humidity - 2, self.humidity + 2)), 40, 62))
        self.packet_rate = int(self.clamp(round(random.uniform(self.packet_rate - 12, self.packet_rate + 14)), 80, 180))
        self.latency_ms = int(self.clamp(round(random.uniform(self.latency_ms - 2, self.latency_ms + 3)), 7, 28))
        self.signal_strength = int(self.clamp(round(random.uniform(self.signal_strength - 2, self.signal_strength + 1)), 86, 100))
        self.network_health = int(self.clamp(round((self.signal_strength + (100 - self.latency_ms)) / 2), 78, 99))
        self.temperature_history.append(self.temperature)
        self.temperature_history = self.temperature_history[-12:]
        self.latency_history.append(self.latency_ms)
        self.latency_history = self.latency_history[-12:]
        self.last_update = datetime.now()
        self.refresh_visuals(previous_temp)

    def schedule_sensor_loop(self) -> None:
        self.update_sensor_data()
        self.sensor_job = self.root.after(3000, self.schedule_sensor_loop)

    def unlock_door(self) -> None:
        if not self.is_locked:
            self.log_event("Unlock packet rejected because node was already open")
            return
        self.is_locked = False
        self.entries_today += 1
        self.last_update = datetime.now()
        self.log_event("Authorized unlock packet accepted by edge lock node")
        self.refresh_visuals()

    def lock_door(self) -> None:
        if self.is_locked:
            self.log_event("Lock command ignored because node was already secure")
            return
        self.is_locked = True
        self.last_update = datetime.now()
        self.log_event("Secure-state packet committed to edge lock node")
        self.refresh_visuals()

    def refresh_sensors(self) -> None:
        self.log_event("Manual device poll started from controller")
        self.update_sensor_data()

    def on_close(self) -> None:
        if self.clock_job is not None:
            self.root.after_cancel(self.clock_job)
            self.clock_job = None
        if self.sensor_job is not None:
            self.root.after_cancel(self.sensor_job)
            self.sensor_job = None
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    MonitoringApp(root)
    root.mainloop()
