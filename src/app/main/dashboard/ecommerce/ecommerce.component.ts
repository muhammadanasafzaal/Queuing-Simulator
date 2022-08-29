import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";

import { CoreConfigService } from "@core/services/config.service";
import { CoreTranslationService } from "@core/services/translation.service";

import { User } from "app/auth/models";
import { colors } from "app/colors.const";
import { AuthenticationService } from "app/auth/service";
import { DashboardService } from "app/main/dashboard/dashboard.service";

import { locale as english } from "app/main/dashboard/i18n/en";
import { locale as french } from "app/main/dashboard/i18n/fr";
import { locale as german } from "app/main/dashboard/i18n/de";
import { locale as portuguese } from "app/main/dashboard/i18n/pt";
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from "@swimlane/ngx-datatable";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { AddDoctorComponent } from "./add-doctor/add-doctor.component";
import { AddPatientComponent } from "./add-patient/add-patient.component";
import swal from "sweetalert2";
import { SessionsComponent } from "./sessions/sessions.component";
import { ServicePatientsComponent } from "./service-patients/service-patients.component";
import { SimulationFormComponent } from "./simulation-form/simulation-form.component";
import { ChartComponent } from "ng-apexcharts";

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};


type ApexXAxis = {
  type?: "category" | "datetime" | "numeric";
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

export type ChartOptions2 = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};


@Component({
  selector: "app-ecommerce",
  templateUrl: "./ecommerce.component.html",
  styleUrls: ["./ecommerce.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class EcommerceComponent implements OnInit {
  // Decorator
  @ViewChild("statisticsBarChartRef") statisticsBarChartRef: any;
  @ViewChild("statisticsLineChartRef") statisticsLineChartRef: any;
  @ViewChild("earningChartRef") earningChartRef: any;
  @ViewChild("revenueReportChartRef") revenueReportChartRef: any;
  @ViewChild("budgetChartRef") budgetChartRef: any;
  @ViewChild("statePrimaryChartRef") statePrimaryChartRef: any;
  @ViewChild("stateWarningChartRef") stateWarningChartRef: any;
  @ViewChild("stateSecondaryChartRef") stateSecondaryChartRef: any;
  @ViewChild("stateInfoChartRef") stateInfoChartRef: any;
  @ViewChild("stateDangerChartRef") stateDangerChartRef: any;
  @ViewChild("goalChartRef") goalChartRef: any;

  // Public
  public data: any;
  public currentUser: User;
  public isAdmin: boolean;
  public isClient: boolean;
  public statisticsBar;
  public statisticsLine;
  public revenueReportChartoptions;
  public budgetChartoptions;
  public goalChartoptions;
  public statePrimaryChartoptions;
  public stateWarningChartoptions;
  public stateSecondaryChartoptions;
  public stateInfoChartoptions;
  public stateDangerChartoptions;
  public earningChartoptions;
  public isMenuToggled = false;

  // Private
  private $barColor = "#f3f3f3";
  private $trackBgColor = "#EBEBEB";
  private $textMutedColor = "#b9b9c3";
  private $budgetStrokeColor2 = "#dcdae3";
  private $goalStrokeColor2 = "#51e5a8";
  private $textHeadingColor = "#5e5873";
  private $strokeColor = "#ebe9f1";
  private $earningsStrokeColor2 = "#28c76f66";
  private $earningsStrokeColor3 = "#28c76f33";
  allDoctors: any = [];
  public ColumnMode = ColumnMode;
  rows: any = [];
  allPatients: any = [];
  totalPatientInHospital: any = 0;
  totalPatientInQueue: any = 0;
  patientTotalTimeInHospital: any = 0;
  patientWaitingTime: any = 0;
  probOfWait: any = 0;
  editData: any = null;
  allSessions: any = [];
  activeSession: any;
  totalServiceTime: number;
  servicedPatients: any = [];
  meanArrivalRate: number;
  meanServiceTime: number;
  resultProb: number;
  avgCustWaiting: number;
  avgCustInSystem: number;
  avgTimeSpentInSysPerCust: any;
  avgCustWaitTimeInQueue: number;
  custWaitForServiceInQueueProb: number;
  serverUtilizationRate: number;
  allPatientInQueue: any = [];
  serverUtilRate: any = null;
  totalServerUtil: any;
  simData: any = null;
  pieChartSeries:any[] = []
  pieChartLabels:any[] = []
  chartColors:any[] = []
  tmpCustArrvData:any;
  tmpServDistTime:any;

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions2>;
  simDataArr: any;
  
  
  /**
   * Constructor
   * @param {AuthenticationService} _authenticationService
   * @param {DashboardService} _dashboardService
   * @param {CoreConfigService} _coreConfigService
   * @param {CoreTranslationService} _coreTranslationService
   */
  constructor(
    private _authenticationService: AuthenticationService,
    private _dashboardService: DashboardService,
    private _coreConfigService: CoreConfigService,
    private _coreTranslationService: CoreTranslationService,
    private modalService: NgbModal
  ) {
    this._authenticationService.currentUser.subscribe(
      (x) => (this.currentUser = x)
    );
    this.isAdmin = this._authenticationService.isAdmin;
    this.isClient = this._authenticationService.isClient;

    this._coreTranslationService.translate(english, french, german, portuguese);
    // Statistics Bar Chart
    this.statisticsBar = {
      chart: {
        height: 70,
        type: "bar",
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      grid: {
        show: false,
        padding: {
          left: 0,
          right: 0,
          top: -15,
          bottom: -15,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "20%",
          startingShape: "rounded",
          colors: {
            backgroundBarColors: [
              this.$barColor,
              this.$barColor,
              this.$barColor,
              this.$barColor,
              this.$barColor,
            ],
            backgroundBarRadius: 5,
          },
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      colors: [colors.solid.warning],
      series: [
        {
          name: "2020",
          data: [45, 85, 65, 45, 65],
        },
      ],
      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
      tooltip: {
        x: {
          show: false,
        },
      },
    };

    // Statistics Line Chart
    this.statisticsLine = {
      chart: {
        height: 70,
        type: "line",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      grid: {
        // show: true,
        borderColor: this.$trackBgColor,
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
        padding: {
          // left: 0,
          // right: 0,
          top: -30,
          bottom: -10,
        },
      },
      stroke: {
        width: 3,
      },
      colors: [colors.solid.info],
      series: [
        {
          data: [0, 20, 5, 30, 15, 45],
        },
      ],
      markers: {
        size: 2,
        colors: colors.solid.info,
        strokeColors: colors.solid.info,
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeDashArray: 0,
        fillOpacity: 1,
        discrete: [
          {
            seriesIndex: 0,
            dataPointIndex: 5,
            fillColor: "#ffffff",
            strokeColor: colors.solid.info,
            size: 5,
          },
        ],
        shape: "circle",
        radius: 2,
        hover: {
          size: 3,
        },
      },
      xaxis: {
        labels: {
          show: true,
          style: {
            fontSize: "0px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
      tooltip: {
        x: {
          show: false,
        },
      },
    };

    // Revenue Report Chart
    this.revenueReportChartoptions = {
      chart: {
        height: 230,
        stacked: true,
        type: "bar",
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          columnWidth: "17%",
          endingShape: "rounded",
        },
      },
      colors: [colors.solid.primary, colors.solid.warning],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        padding: {
          top: -20,
          bottom: -10,
        },
        yaxis: {
          lines: { show: false },
        },
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
        ],
        labels: {
          style: {
            colors: this.$textMutedColor,
            fontSize: "0.86rem",
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: this.$textMutedColor,
            fontSize: "0.86rem",
          },
        },
      },
    };

    // Budget Chart
    this.budgetChartoptions = {
      chart: {
        height: 80,
        toolbar: { show: false },
        zoom: { enabled: false },
        type: "line",
        sparkline: { enabled: true },
      },
      stroke: {
        curve: "smooth",
        dashArray: [0, 5],
        width: [2],
      },
      colors: [colors.solid.primary, this.$budgetStrokeColor2],
      tooltip: {
        enabled: false,
      },
    };

    // Goal Overview  Chart
    this.goalChartoptions = {
      chart: {
        height: 245,
        type: "radialBar",
        sparkline: {
          enabled: true,
        },
        dropShadow: {
          enabled: true,
          blur: 3,
          left: 1,
          top: 1,
          opacity: 0.1,
        },
      },
      colors: [this.$goalStrokeColor2],
      plotOptions: {
        radialBar: {
          offsetY: -10,
          startAngle: -150,
          endAngle: 150,
          hollow: {
            size: "77%",
          },
          track: {
            background: this.$strokeColor,
            strokeWidth: "50%",
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              color: this.$textHeadingColor,
              fontSize: "2.86rem",
              fontWeight: "600",
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          gradientToColors: [colors.solid.success],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      stroke: {
        lineCap: "round",
      },
      grid: {
        padding: {
          bottom: 30,
        },
      },
    };

    // Browser States Primary Chart
    this.statePrimaryChartoptions = {
      chart: {
        height: 30,
        width: 30,
        type: "radialBar",
      },
      grid: {
        show: false,
        padding: {
          left: -15,
          right: -15,
          top: -12,
          bottom: -15,
        },
      },
      colors: [colors.solid.primary],
      series: [54.4],
      plotOptions: {
        radialBar: {
          hollow: {
            size: "22%",
          },
          track: {
            background: this.$trackBgColor,
          },
          dataLabels: {
            showOn: "always",
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
    };

    // Browser States Warning Chart
    this.stateWarningChartoptions = {
      chart: {
        height: 30,
        width: 30,
        type: "radialBar",
      },
      grid: {
        show: false,
        padding: {
          left: -15,
          right: -15,
          top: -12,
          bottom: -15,
        },
      },
      colors: [colors.solid.warning],
      series: [6.1],
      plotOptions: {
        radialBar: {
          hollow: {
            size: "22%",
          },
          track: {
            background: this.$trackBgColor,
          },
          dataLabels: {
            showOn: "always",
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
    };

    // Browser States Secondary Chart
    this.stateSecondaryChartoptions = {
      chart: {
        height: 30,
        width: 30,
        type: "radialBar",
      },
      grid: {
        show: false,
        padding: {
          left: -15,
          right: -15,
          top: -12,
          bottom: -15,
        },
      },
      colors: [colors.solid.secondary],
      series: [14.6],
      plotOptions: {
        radialBar: {
          hollow: {
            size: "22%",
          },
          track: {
            background: this.$trackBgColor,
          },
          dataLabels: {
            showOn: "always",
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
    };

    // Browser States Info Chart
    this.stateInfoChartoptions = {
      chart: {
        height: 30,
        width: 30,
        type: "radialBar",
      },
      grid: {
        show: false,
        padding: {
          left: -15,
          right: -15,
          top: -12,
          bottom: -15,
        },
      },
      colors: [colors.solid.info],
      series: [4.2],
      plotOptions: {
        radialBar: {
          hollow: {
            size: "22%",
          },
          track: {
            background: this.$trackBgColor,
          },
          dataLabels: {
            showOn: "always",
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
    };

    // Browser States Danger Chart
    this.stateDangerChartoptions = {
      chart: {
        height: 30,
        width: 30,
        type: "radialBar",
      },
      grid: {
        show: false,
        padding: {
          left: -15,
          right: -15,
          top: -12,
          bottom: -15,
        },
      },
      colors: [colors.solid.danger],
      series: [8.4],
      plotOptions: {
        radialBar: {
          hollow: {
            size: "22%",
          },
          track: {
            background: this.$trackBgColor,
          },
          dataLabels: {
            showOn: "always",
            name: {
              show: false,
            },
            value: {
              show: false,
            },
          },
        },
      },
      stroke: {
        lineCap: "round",
      },
    };

    // Earnings Chart
    this.earningChartoptions = {
      chart: {
        type: "donut",
        height: 120,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      series: [53, 16, 31],
      legend: { show: false },
      comparedResult: [2, -3, 8],
      labels: ["App", "Service", "Product"],
      stroke: { width: 0 },
      colors: [
        this.$earningsStrokeColor2,
        this.$earningsStrokeColor3,
        colors.solid.success,
      ],
      grid: {
        padding: {
          right: -20,
          bottom: -8,
          left: -20,
        },
      },
      plotOptions: {
        pie: {
          startAngle: -10,
          donut: {
            labels: {
              show: true,
              name: {
                offsetY: 15,
              },
              value: {
                offsetY: -15,
                formatter: function (val) {
                  return parseInt(val) + "%";
                },
              },
              total: {
                show: true,
                offsetY: 15,
                label: "App",
                formatter: function (w) {
                  return "53%";
                },
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 1325,
          options: {
            chart: {
              height: 100,
            },
          },
        },
        {
          breakpoint: 1200,
          options: {
            chart: {
              height: 120,
            },
          },
        },
        {
          breakpoint: 1065,
          options: {
            chart: {
              height: 100,
            },
          },
        },
        {
          breakpoint: 992,
          options: {
            chart: {
              height: 120,
            },
          },
        },
      ],
    };




  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // get the currentUser details from localStorage
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Get the dashboard service data
    this._dashboardService.onApiDataChanged.subscribe((response) => {
      this.data = response;
    });

    Promise.all([
      // this.getAllDoctors(),
      // this.getAllPatients(),
      // this.getAllSessions(),
    ]).then((values) => {});
  }

  /**
   * After View Init
   */
  ngAfterViewInit() {
    // Subscribe to core config changes
    this._coreConfigService.getConfig().subscribe((config) => {
      // If Menu Collapsed Changes
      if (
        (config.layout.menu.collapsed === true ||
          config.layout.menu.collapsed === false) &&
        localStorage.getItem("currentUser")
      ) {
        setTimeout(() => {
          if (this.currentUser.role == "Admin") {
            // Get Dynamic Width for Charts
            this.isMenuToggled = true;
            this.statisticsBar.chart.width =
              this.statisticsBarChartRef?.nativeElement.offsetWidth;
            this.statisticsLine.chart.width =
              this.statisticsLineChartRef?.nativeElement.offsetWidth;
            this.earningChartoptions.chart.width =
              this.earningChartRef?.nativeElement.offsetWidth;
            this.revenueReportChartoptions.chart.width =
              this.revenueReportChartRef?.nativeElement.offsetWidth;
            this.budgetChartoptions.chart.width =
              this.budgetChartRef?.nativeElement.offsetWidth;
            this.goalChartoptions.chart.width =
              this.goalChartRef?.nativeElement.offsetWidth;
          }
        }, 500);
      }
    });
  }

  openAddDoctorForm(value) {
    const modalRef = this.modalService.open(AddDoctorComponent, { size: "lg" });
    if (value) {
      console.log("on doctor add");
      this.editData = null;
      modalRef.componentInstance.editData = this.editData;
      let currentSessionData = this.allSessions.find(
        (item) => item.isActive === 1
      );
      let currentSessionDate = currentSessionData.sessionDate.split("T")[0];

      modalRef.componentInstance.currentSessionId = currentSessionData.id;
      modalRef.componentInstance.currentSessionDate = currentSessionDate;
    } else {
      console.log("on doctor update");
      modalRef.componentInstance.editData = this.editData;
    }
    modalRef.componentInstance.refreshDocTbl.subscribe((refreshStatus) => {
      console.log(refreshStatus);
      if (refreshStatus) {
        // this.getAllDoctors();
        return new Promise((resolve, reject) => {
          this._dashboardService.GetAllDoctors().subscribe((res) => {
            this.allDoctors = res;
            this.rows = this.allDoctors;
            let data = {
              id: this.activeSession.id,
              sessionDate: this.activeSession.sessionDate,
              totalDoctorsOnService: this.allDoctors.length,
              totalPatientsArrived: this.activeSession.totalPatientsArrived,
              totalTimeOfEachSession: this.activeSession.totalTimeOfEachSession,
              averagePatientServiceTime:
                this.activeSession.averagePatientServiceTime,
              isActive: this.activeSession.isActive,
            };
            this.updateSession(data, this.activeSession.id);
          });
        });
      }
    });
  }

  openAddPatientForm(value) {
    const modalRef = this.modalService.open(AddPatientComponent, {
      size: "lg",
    });
    if (value) {
      console.log("on patient add");
      this.editData = null;
      modalRef.componentInstance.editData = this.editData;
      let currentSessionData = this.allSessions.find(
        (item) => item.isActive === 1
      );
      let currentSessionDate = currentSessionData.sessionDate.split("T")[0];

      modalRef.componentInstance.currentSessionId = currentSessionData.id;
      modalRef.componentInstance.currentSessionDate = currentSessionDate;
    } else {
      console.log("on patient update");
      modalRef.componentInstance.editData = this.editData;
    }
    modalRef.componentInstance.refreshPatTbl.subscribe((refreshStatus) => {
      console.log(refreshStatus);
      if (refreshStatus) {
        // this.getAllPatients();
        return new Promise((resolve, reject) => {
          this._dashboardService.GetAllPatients().subscribe((res) => {
            this.allPatients = res;

            let data = {
              id: this.activeSession.id,
              sessionDate: this.activeSession.sessionDate,
              totalDoctorsOnService: this.activeSession.totalDoctorsOnService,
              totalPatientsArrived: this.allPatients.length,
              totalTimeOfEachSession: this.activeSession.totalTimeOfEachSession,
              averagePatientServiceTime:
                this.activeSession.averagePatientServiceTime,
              isActive: this.activeSession.isActive,
            };
            this.updateSession(data, this.activeSession.id);
            this.allPatientInQueue = this.allPatients.filter(
              (element) => element.isServiced == 0
            );
            console.log(this.allPatientInQueue, "patients in queue  ");
          });
        });
      }
    });
  }

  openAddSessionForm(value) {
    const modalRef = this.modalService.open(SessionsComponent, {
      size: "md",
    });
    if (value) {
      console.log("on session add");
      this.editData = null;
      modalRef.componentInstance.editData = this.editData;
    } else {
      console.log("on session update");
      modalRef.componentInstance.editData = this.editData;
    }
    modalRef.componentInstance.refreshSesTbl.subscribe((refreshStatus) => {
      console.log(refreshStatus);
      if (refreshStatus) {
        this.getAllSessions();
      }
      // sessionTimeout(sessionTimeout);
    });
  }

  openServicePatient() {
    const modalRef = this.modalService.open(ServicePatientsComponent, {
      size: "lg ",
    });
    if (this.allPatients.length > 0) {
      modalRef.componentInstance.allPatientsData = this.allPatients;
    }
    if (this.allDoctors.length > 0) {
      modalRef.componentInstance.allDoctorsData = this.allDoctors;
    }
    modalRef.componentInstance.refreshPatTbl.subscribe((refreshStatus) => {
      console.log(refreshStatus);
      if (refreshStatus) {
        this.getAllPatients();
      }
    });
  }

  getAllDoctors() {
    return new Promise((resolve, reject) => {
      this._dashboardService.GetAllDoctors().subscribe((res) => {
        this.allDoctors = res;
        this.rows = this.allDoctors;
        console.log(this.rows);
      });
    });
  }

  getAllPatients() {
    return new Promise((resolve, reject) => {
      this._dashboardService.GetAllPatients().subscribe((res) => {
        this.allPatients = res;
        console.log(this.allPatients);
        this.allPatientInQueue = this.allPatients.filter(
          (element) => element.isServiced == 0
        );
        console.log(this.allPatientInQueue, "patients in queue  ");
      });
    });
  }

  getAllSessions() {
    return new Promise((resolve, reject) => {
      this._dashboardService.GetAllSessions().subscribe((res) => {
        this.allSessions = res;
        console.log(this.allSessions);
        this.expireCurrentSession();
        this.activeSession = this.allSessions.find(
          (item) => item.isActive === 1
        );
        console.log(this.activeSession);

        this.getActiveSessionServicedPatient();

        if (this.activeSession != null) {
          let totalSessionTime = this.activeSession.totalTimeOfEachSession;
          this.meanArrivalRate =
            this.servicedPatients.length / totalSessionTime;
          console.log(this.meanArrivalRate, "mean arrival time");
        }

        this.getAllValues();
        // this._dashboardService.sessionData = activeSession;
      });
    });
  }

  doctorToEdit(editData) {
    this.editData = editData;
    console.log(this.editData);
    this.openAddDoctorForm(false);
  }

  patientToEdit(editData) {
    this.editData = editData;
    console.log(this.editData);
    this.openAddPatientForm(false);
  }

  sessionToEdit(editData) {
    this.editData = editData;
    console.log(this.editData);
    this.openAddSessionForm(false);
  }

  updateSession(data, id) {
    return new Promise((resolve, reject) => {
      this._dashboardService.UpdateSession(data, id).subscribe((res) => {
        // this._dashboardService.swalUpdateSuccess();
        // console.log('data updated')
        this.getAllSessions();
      });
    });
  }

  deleteDoctor(id) {
    return new Promise((resolve, reject) => {
      swal
        .fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#7367f0",
          cancelButtonColor: "#82868b",
          confirmButtonText: "Yes",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this._dashboardService.DeleteDoctor(id).subscribe((res) => {
              swal.fire("Deleted!", "Doctor deleted successfully", "success");
              // this.getAllDoctors();

              return new Promise((resolve, reject) => {
                this._dashboardService.GetAllDoctors().subscribe((res) => {
                  this.allDoctors = res;
                  this.rows = this.allDoctors;
                  let data = {
                    id: this.activeSession.id,
                    sessionDate: this.activeSession.sessionDate,
                    totalDoctorsOnService: this.allDoctors.length,
                    totalPatientsArrived:
                      this.activeSession.totalPatientsArrived,
                    totalTimeOfEachSession:
                      this.activeSession.totalTimeOfEachSession,
                    averagePatientServiceTime:
                      this.activeSession.averagePatientServiceTime,
                    isActive: this.activeSession.isActive,
                  };
                  this.updateSession(data, this.activeSession.id);
                });
              });
            });
          }
        });
    });
  }

  deletePatient(id) {
    console.log(id);
    return new Promise((resolve, reject) => {
      swal
        .fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#7367f0",
          cancelButtonColor: "#82868b",
          confirmButtonText: "Yes",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this._dashboardService.DeletePatient(id).subscribe((res) => {
              swal.fire("Deleted!", "Patient deleted successfully", "success");
              // this.getAllPatients();

              return new Promise((resolve, reject) => {
                this._dashboardService.GetAllPatients().subscribe((res) => {
                  this.allPatients = res;
                  let data = {
                    id: this.activeSession.id,
                    sessionDate: this.activeSession.sessionDate,
                    totalDoctorsOnService:
                      this.activeSession.totalDoctorsOnService,
                    totalPatientsArrived: this.allPatients.length,
                    totalTimeOfEachSession:
                      this.activeSession.totalTimeOfEachSession,
                    averagePatientServiceTime:
                      this.activeSession.averagePatientServiceTime,
                    isActive: this.activeSession.isActive,
                  };
                  this.updateSession(data, this.activeSession.id);
                });
              });
            });
          }
        });
    });
  }

  deleteSession(id) {
    console.log(id);
    return new Promise((resolve, reject) => {
      swal
        .fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#7367f0",
          cancelButtonColor: "#82868b",
          confirmButtonText: "Yes",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this._dashboardService.DeleteSession(id).subscribe((res) => {
              swal.fire("Deleted!", "Session deleted successfully", "success");
              this.getAllSessions();
            });
          }
        });
    });
  }

  // sessionTimeout(value){
  //   const myTimeout = setTimeout(this.expireCurrentSession, value);
  // }

  // expireSessionOnTimeOut(){
  //   setTimeout(() => {
  //     this.expireCurrentSession()
  //   }, 5000);
  // }

  expireCurrentSession() {
    console.log(this.allSessions);

    if (this.allSessions.length > 0) {
      let lastActiveSession = this.allSessions.find(
        (item) => item.isActive === 1
      );
      console.log(lastActiveSession);

      if (lastActiveSession != null) {
        let prevSesDate = lastActiveSession.sessionDate.split("T")[0];
        console.log(prevSesDate);
        let prevDateWithOutZero = prevSesDate.replace(/-0+/g, "-");
        // var todayDate = new Date().toISOString().slice(0, 10);
        let todayDate = this.calcLocalTime("+5");
        console.log(todayDate);

        let tempPrvDate = new Date(prevDateWithOutZero);
        let tempCrrDate = new Date(todayDate);

        if (tempPrvDate < tempCrrDate) {
          const data = {
            averagePatientServiceTime:
              lastActiveSession.averagePatientServiceTime,
            id: lastActiveSession.id,
            isActive: 0,
            sessionDate: lastActiveSession.sessionDate,
            totalDoctorsOnService: lastActiveSession.totalDoctorsOnService,
            totalPatientsArrived: lastActiveSession.totalPatientsArrived,
            totalTimeOfEachSession: lastActiveSession.totalTimeOfEachSession,
          };
          return new Promise((resolve, reject) => {
            this._dashboardService
              .UpdateSession(data, lastActiveSession.id)
              .subscribe((res) => {
                alert("Last session has expired, please create a new session");
                this.getAllSessions();
                // this.refreshDoctorTbl();
                // this.closeModal();
              });
          });
        } else {
        }
      } else {
        alert("Please create a new session");
      }
    } else {
      alert("No Session available. Please create a new session");
    }
  }

  calcLocalTime(offset) {
    // create Date object for current location
    var d = new Date();

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + 3600000 * offset);

    // return time as a string
    // return nd.toLocaleString();
    let dateWithTime = nd.toLocaleString();
    let dateOnly = dateWithTime.split(" ")[0];
    let finalDate = dateOnly.slice(0, -1);
    return finalDate.split("/").reverse().join("-");
  }

  //FORMULAS
  getAllValues() {
    let totalServers = this.rows.length;
    let avgArrivalRateHr = Math.round(this.meanArrivalRate);
    let avgServiceRateHr = Math.round(60 / this.meanServiceTime);

    console.log(totalServers);
    console.log(avgArrivalRateHr);
    console.log(avgServiceRateHr);

    //summation calc
    let summ = 0;
    for (let i = 0; i < totalServers; i++) {
      summ +=
        (1 / this.getfactorial(i)) * (avgArrivalRateHr / avgServiceRateHr) ** i;
      // console.log(summ);
    }
    console.log(summ, "summation");
    let lastSummVal =
      (1 / this.getfactorial(totalServers)) *
      (avgArrivalRateHr / avgServiceRateHr) ** totalServers;
    console.log(lastSummVal);

    //prob that no customer is in system (idle state) - 1/Po
    this.resultProb =
      1 /
      (summ +
        lastSummVal *
          (1 / (1 - avgArrivalRateHr / (totalServers * avgServiceRateHr))));
    console.log(
      this.resultProb,
      "prob that no customer is in system(idle) - 1/Po"
    );

    // console.log(( (1/(1-(avgArrivalRateHr/(totalServers*avgServiceRateHr)))) ))

    //avg no of customer in waiting to be served - Lq
    this.avgCustWaiting =
      (((1 / this.getfactorial(totalServers - 1)) *
        (avgArrivalRateHr / avgServiceRateHr) ** totalServers *
        (avgArrivalRateHr * avgServiceRateHr)) /
        (totalServers * avgServiceRateHr - avgArrivalRateHr) ** 2) *
      this.resultProb;
    console.log(this.avgCustWaiting, "avg customer waiting to be served - Lq");

    //avg no of customer in system - Ls
    this.avgCustInSystem =
      this.avgCustWaiting + avgArrivalRateHr / avgServiceRateHr;
    console.log(this.avgCustInSystem, "avg no of customer in system - Ls");

    //expected time a customer wait in queue after arrival - Wq
    this.avgCustWaitTimeInQueue = this.avgCustWaiting / avgArrivalRateHr;
    console.log(
      this.avgCustWaitTimeInQueue,
      "expected time a customer wait in queue after arrival - Wq"
    );

    //avg time a customer spends in system - Ws
    this.avgTimeSpentInSysPerCust =
      this.avgCustWaitTimeInQueue + 1 / avgServiceRateHr;
    console.log(
      this.avgTimeSpentInSysPerCust,
      "avg time a customer spends in system - Ws"
    );

    //if no of customer in system are more or equal to no of servers available then we find
    // the prob that customer waits for its service in queue - P(n>=k)
    this.custWaitForServiceInQueueProb =
      (1 / this.getfactorial(totalServers)) *
      (avgArrivalRateHr / avgServiceRateHr) ** totalServers *
      ((1 / (1 - avgArrivalRateHr / (totalServers * avgServiceRateHr))) *
        this.resultProb);
    console.log(
      this.custWaitForServiceInQueueProb,
      "prob that customer waits for its service in queue - P(n>=k)"
    );

    //traffic intensity/server utilization rate - P
    this.serverUtilizationRate =
      (avgArrivalRateHr / (totalServers * avgServiceRateHr)) * 100;
    console.log(this.serverUtilizationRate, "server utilization rate - P");
  }

  getfactorial(n) {
    if (n < 0) return;
    if (n < 2) return 1;
    return n * this.getfactorial(n - 1);
  }

  getActiveSessionServicedPatient() {
    if (this.allPatients.length > 0) {
      let activeSessionId = this.activeSession.id;
      let activeSessionPatients = this.allPatients.filter(
        (element) => element.sessionId == activeSessionId
      );
      console.log(activeSessionPatients, "all active session patients");

      this.servicedPatients = activeSessionPatients.filter(
        (element) => element.isServiced == 1
      );
      console.log(
        this.servicedPatients,
        "all active session serviced patients"
      );

      if (this.servicedPatients.length > 0) {
        const sumAllServiceTime = this.servicedPatients.reduce(
          (accumulator, object) => {
            return accumulator + object.totalServiceTime;
          },
          0
        );

        console.log(sumAllServiceTime);
        console.log(this.servicedPatients.length);
        this.meanServiceTime = sumAllServiceTime / this.servicedPatients.length;
        console.log(this.meanServiceTime, "mean service time");
      }
    }
  }

  //simulation data form modal
  openSimulationDataModal() {
    const modalRef = this.modalService.open(SimulationFormComponent, {
      size: "lg",
    });
    // if (value) {
    //   console.log("on doctor add");
    //   this.editData = null;
    //   modalRef.componentInstance.editData = this.editData;
    //   let currentSessionData = this.allSessions.find(
    //     (item) => item.isActive === 1
    //   );
    //   let currentSessionDate = currentSessionData.sessionDate.split("T")[0];

    //   modalRef.componentInstance.currentSessionId = currentSessionData.id;
    //   modalRef.componentInstance.currentSessionDate = currentSessionDate;
    // } else {
    //   console.log("on doctor update");
    //   modalRef.componentInstance.editData = this.editData;
    // }
    modalRef.componentInstance.simData.subscribe((data) => {
      console.log(data);
      this.simData =  []
      this.simDataArr = null
      this.tmpCustArrvData = null
      this.tmpServDistTime = null
      this.serverUtilRate = null
      this.pieChartSeries = []
      this.pieChartLabels = []
      this.chartColors = []

      this.simData = data;
      this.serverUtilRate = data.serverUtilRate;
      this.tmpCustArrvData =  this.simData.tmpCustArrvData
      this.tmpServDistTime = this.simData.tmpServDistTime
      this.simDataArr = this.simData.tmpServData

      this.simData.serverUtilRate.forEach(element => {
        this.pieChartSeries.push(parseFloat(element.serverUtilRate.toFixed(2)))
        this.pieChartLabels.push("Server"+" "+element.serverNo)
        this.chartColors.push("#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16)}))
      });



      console.log(this.pieChartSeries)
      console.log(this.pieChartLabels)

      if (this.simData != null) {
        this.chartOptions = {
          series: this.pieChartSeries,
          chart: {
            type: "donut",
          },
          labels: this.pieChartLabels,
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200,
                },
                legend: {
                  position: "bottom",
                },
              },
            },
          ],
        };
      }


      this.chartOptions2 = {
        series: [
          {
            name: "rate",
            data: this.pieChartSeries
          }
        ],
        chart: {
          height: 350,
          type: "bar",
          events: {
            click: function(chart, w, e) {
              // console.log(chart, w, e)
            }
          }
        },
        colors: this.chartColors,
        plotOptions: {
          bar: {
            columnWidth: "45%",
            distributed: true
          }
        },
        dataLabels: {
          enabled: true
        },
        legend: {
          show: false
        },
        grid: {
          show: true
        },
        xaxis: {
          categories: this.pieChartLabels,
          labels: {
            style: {
              colors: this.chartColors,
              fontSize: "12px"
            }
          }
        }
      };

    });
    //   console.log(refreshStatus);
    //   if (refreshStatus) {
    //     // this.getAllDoctors();
    //     return new Promise((resolve, reject) => {
    //       this._dashboardService.GetAllDoctors().subscribe((res) => {
    //         this.allDoctors = res;
    //         this.rows = this.allDoctors;
    //         let data = {
    //           id: this.activeSession.id,
    //           sessionDate: this.activeSession.sessionDate,
    //           totalDoctorsOnService: this.allDoctors.length,
    //           totalPatientsArrived: this.activeSession.totalPatientsArrived,
    //           totalTimeOfEachSession: this.activeSession.totalTimeOfEachSession,
    //           averagePatientServiceTime:
    //             this.activeSession.averagePatientServiceTime,
    //           isActive: this.activeSession.isActive,
    //         };
    //         this.updateSession(data, this.activeSession.id);
    //       });
    //     });
    //   }
    // });
  }
}
